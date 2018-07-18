var express = require("express");
var app = express();


app.use(express.static(__dirname)); // static domain url


var bodyParser = require("body-parser"); // XMLHttp content parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


var cookieParser = require("cookie-parser")(); // cookie parser
app.use(cookieParser);
var session = require("cookie-session")({// connect module cookie-session and access-time two hours
    keys: ["secret"],
    maxAge: 2 * 60 * 60 * 1000
});
app.use(session);


var passport = require("passport"); // connect module passport
app.use(passport.initialize());
app.use(passport.session());


var facebookAuth = require("./modules/facebookauth.js"); // connect FacebookAuth properties


var multer = require("multer"); // connect service for save downloaded file
var multer_properties = require("./modules/multer_properties");
var storage = multer.diskStorage(multer_properties);
var upload = multer({storage: storage});


var db = require("./modules/mongo_connect"); // connect to function for working with mongoDB
var AddAdmin = require("./models/adminmodel"); // connect Admin model
var Usert = require("./models/usermodel"); // connect User model






var FacebookStrategy = require("passport-facebook").Strategy; // set Facebook Strategy
passport.use(new FacebookStrategy(facebookAuth, function(token, refreshToken, profile, done) {
    var sr = {
        id: profile.id
    };
    Usert.find(sr, function(err, data) { // find user in database and return
        if(err) {
            console.log(err);
            return "database error";
        }
        var return_obj = {
            id: data[0]._id,
            photos: profile.photos[0].value
        };
        if(data.length)
            return done(null, return_obj);
        else { // otherwise create new user
            var obj = {
                "id": profile.id,
                "name": profile.displayName,
                "email": profile.emails[0].value || "",
                "password": token
            };
            var newuser = new Usert(obj);
            newuser.save(function(err, user) {
                if(err) {
                    console.log(err);
                    return "database error";
                }
                var return_obj = {
                    id: user._id,
                    photos: profile.photos[0].value
                };
                return done(null, return_obj);
            });
        }
    });
}));



var LocalStrategy = require("passport-local").Strategy; // connect Local Strategy for authetication and create instance passport-local
passport.use(new LocalStrategy(function(username, password, done) {
    var sr = {
        username: username,
        password: password
    };
    AddAdmin.find(sr, function(err, data) { // find admin account
        if(err) {
            console.log(err);
            return "database error";
        }
        if(data.length) {
            var return_obj = {
                id: data[0]._id
            };
            return done(null, return_obj);
        } else {
            var sr = {
                name: username,
                password: password
            };
            Usert.find(sr, function(err, data) { // find user account
                if(err) {
                    console.log(err);
                    return "database error";
                }
                if(data.length) {
                    var return_obj = {
                        id: data[0]._id
                    };
                    return done(null, return_obj);
                } else
                    return done(null, false);
            });
        }
    });
}
));




passport.serializeUser(function(user, done) { // serializing
    return done(null, user);
});

passport.deserializeUser(function(user, done) { // deserializing
    var sr = {
        _id: user.id
    };
    AddAdmin.find(sr, function(err, data) {
        if(err) {
            console.log(err);
            return "database error";
        }
        if(data.length) {
            var return_obj = {
                username: data[0].username,
                id: data[0]._id
            };
            return done(null, return_obj);
        } else
            Usert.find(sr, function(err, data) {
                if(err) {
                    console.log(err);
                    return "database error";
                }
                if(data.length) {
                    data[0].photos = user.photos;
                    return done(null, data[0]);
                } else
                    return done(null, false);
            });
    });
});



var adminLogRout = {
    successRedirect: "/admin",
    failureRedirect: "/adminlogin"
};
var authAdmin = passport.authenticate("local", adminLogRout);
var userLogRout = {
    successRedirect: "/",
    failureRedirect: "/"
};
var auth = passport.authenticate("local", userLogRout);
var isAuthAdmin = function(req, res, next) {
    if(req.isAuthenticated() && req.user.username)
        next();
    else
        res.redirect("/adminlogin");
};







// authentication routing
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.post("/login", auth);
app.get("/auth/facebook", passport.authenticate("facebook", {scope: 'email'}));
app.get("/auth/facebook/callback", passport.authenticate("facebook", userLogRout));
app.get("/admin", isAuthAdmin);
app.get("/admin", function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});
app.get("/adminlogin", function(req, res) {
    res.sendFile(__dirname + "/login.html");
});
app.post("/adminlogin", authAdmin);

app.get("/fgetuser", function(req, res) {
    if(req.session) {
        if(req.user) {
            var user = {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                address: req.user.address,
                photos: req.session.passport.user.photos
            };
            res.send(user);
        } else
            res.send(false);
    } else
        res.send(false);
});
app.post("/adminvalid", function(req, res) {
    var callback = {
        nul: function(args) {
            args.res.send("Неправильний логін, або пароль!");
            return;
        },
        succ: function(args) {
            args.res.send(true);
        }
    };
    db.find(AddAdmin, req.body, {res: res}, callback);
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});





// uploading routing
app.post("/uploadFile", upload.single("upl"), function(req, res) {
    res.send(req.file.path);
});




var router = require("./router_db");
app.use("/", router);


app.listen(process.env.PORT || 8080);
console.log("Run server!");