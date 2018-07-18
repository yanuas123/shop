var express = require("express");
var router = express.Router();
var ordermail = require("./modules/ordermail"); // function for send mail when order is confirmed


var db = require("./modules/mongo_connect"); // connect to function for working with mongoDB
var AddGood = require("./models/goodmodel"); // connect Good model
var AddOrder = require("./models/ordermodel"); // connect Order model
var AddCtgr = require("./models/categorymodel"); // connect Category model
var Usert = require("./models/usermodel"); // connect User model




// database routing
router.get("/loaddata", function(req, res) {
    var callback = {
        succ: function(args, res_data) {
            var callback = {
                succ: function(args, res_data) {
                    var res = [];
                    var goodsInOrder = [];
                    res_data.forEach(function(item) { // create array of goods from orders
                        for(var i = 0; i < item.order.length; i++) {
                            goodsInOrder.push({
                                name: item.order[i].name,
                                qt: item.order[i].qt
                            });
                        }
                    });
                    args.goods.forEach(function(item) {
                        if(item.count) { // if good has 0 qt.
                            for(var i = 0; i < goodsInOrder.length; i++) { // deleting qt. from goods that contains in orders
                                if(item.name == goodsInOrder[i].name) {
                                    item.count = item.count - goodsInOrder[i].qt;
                                }
                            }
                            if(item.count > 0) res.push(item);
                        }
                    });
                    args.res.send(res);
                }
            };
            var arguments = {
                res: args.res,
                goods: res_data
            };
            db.find(AddOrder, "all", arguments, callback);
        }
    };
    db.find(AddGood, "all", {res: res}, callback);
});
router.get("/loaddataserver", function(req, res) {
    db.find(AddGood, "all", {res: res});
});
router.get("/loadcategory", function(req, res) {
    db.find(AddCtgr, "all", {res: res});
});
router.get("/loadorders", function(req, res) {
    db.find(AddOrder, "all", {res: res});
});
router.post("/getoneuser", function(req, res) {
    db.find(Usert, req.body.id, {res: res});
});
router.post("/addgoods", function(req, res) {
    req.body.price = +req.body.price;
    var callback = {
        succ: function(args) {
            args.res.send("Товар доданий!");
        }
    };
    db.create(AddGood, req.body, {res: res}, callback);
});
router.post("/editgood", function(req, res) {
    var callback = {
        succ: function(args, res_data) {
            args.res.send("Властивості позиції змінено!");
        }
    };
    db.update(AddGood, req.body, {res: res}, callback);
});
router.post("/delgood", function(req, res) {
    var callback = {
        succ: function(args, res_data) {
            args.res.send("Товар видалено!");
        }
    };
    db.delete(AddGood, req.body, {res: res}, callback);
});
router.post("/addcategory", function(req, res) {
    var callback = {
        succ: function(args) {
            args.res.send("Категорію додано!");
        }
    };
    db.create(AddCtgr, req.body, {res: res}, callback);
});
router.post("/adduser", function(req, res) {
    var callback = {
        nul: function(args) {
            var callback = {
                nul: function(args) {
                    var callback = {
                        succ: function(args) {
                            args.res.send("Ваш акаунт створений. Щоб скористатися акаунтом, увійдіть!");
                        }
                    };
                    db.create(Usert, req.body, {res: args.res}, callback);
                },
                succ: function(args) {
                    args.res.send("Користувач з таким email вже існує!");
                }
            };
            db.find(Usert, {email: req.body.email}, {res: args.res}, callback);
        },
        succ: function(args) {
            args.res.send("Користувач з таким іменем вже існує!\nВиберіть інше ім'я.");
        }
    };
    db.find(Usert, {name: req.body.name}, {res: res}, callback);
});
router.post("/updateuser", function(req, res) {
    db.update(Usert, req.body, {res: res});
});
router.post("/neworder", function(req, res) {
    var callback = {
        succ: function(args) {
            args.res.send("Замовлення надіслане!");
        }
    };
    db.create(AddOrder, req.body, {res: res}, callback);
});
router.post("/conforder", function(req, res) {
    var err_box = {
        product_err: {
            bool: false,
            datas: []
        },
        order_err: null
    };
    function addStateDatasProd(item, inf, bool) { // add datas to error-box
        err_box.product_err.bool = bool;
        err_box.product_err.datas.push({
            product: item.name,
            id: item._id,
            error: inf
        });
    }
    var callbackProd = {// callback for iteration-function for udating products from array
        err: function(item, err) {
            console.log(err);
            addStateDatasProd(item, err, true);
        },
        nul: function(item) {
            console.log("error update AddGood: null");
            addStateDatasProd(item, "Could not to find the product-name in database.", true);
        },
        succ: function(item, data) {
            addStateDatasProd(item, ("Deleted " + item.qt + "qty."), false);
        }
    };
    function addStateDatas(inf) { // adding datas to error-box
        err_box.order_err.push({
            order: req.body._id,
            error: inf
        });
    }
    function delOrder() {
        if(err_box.product_err.bool) { // if error from updating of products, cancel and return error-message
            res.send(err_box);
            return;
        }
        var callback = {// callback for deleting of order
            err: function(args, err) {
                console.log(err);
                addStateDatas(err);
                args.res.send(err_box);
            },
            nul: function(args) {
                console.log("error delete AddOrder: null");
                addStateDatas("Could not to find the order in database.");
                args.res.send(err_box);
            },
            succ: function(args) {
                args.info = "Замовлення підтверджене і видалене!";
                if(args.datas.user_id) { // if account-customer exists 
                    var callbacks = {
                        err: function(args, err) {
                            console.log(err);
                            addStateDatas("Замовлення підтверджене і видалене, але при пошуку інформації покупця для відправлення повідомлення база даних не відповідає!");
                            args.res.send(err_box);
                        },
                        nul: function(args) {
                            console.log("Do not found user-name in database while send order-mail!");
                            addStateDatas("Замовлення підтверджене і видалене, але користувача в базі даних не знайдено.");
                            args.res.send(err_box);
                        },
                        succ: function(args, res_data) {
                            args.datas.email = res_data.email;
                            args.datas.address = res_data.address;
                            args.mailing(args.datas, args);
                        }
                    };
                    db.find(Usert, args.datas.user_id, args, callbacks);
                } else args.mailing(args.datas, args);
            }
        };
        var args = {// arguments to deleting-function(order)
            res: res,
            datas: req.body,
            mailing: ordermail // service for sending email-messages to customer
        };
        db.delete(AddOrder, req.body._id, args, callback);
    }
    function eachOfProduct(i) { // recursion-function for updating of products
        if(i === req.body.order.length) { //
            delOrder();
            return;
        }
        var item = req.body.order[i];
        item.data = {
            count: item.count
        };
        AddGood.update({_id: item._id}, {$set: item.data}, function(err, data) {
            if(err) callbackProd.err(item, err);
            else if(!data.ok) callbackProd.nul(item);
            else callbackProd.succ(item, data);
            eachOfProduct(++i);
        });
    }
    eachOfProduct(0);
});
module.exports = router;