var mongoose = require("mongoose");
mongoose.connect("mongodb://xxxx:xxxxxx@ds147190.mlab.com:47190/myshoplist", {useNewUrlParser: true});
console.log("mongo");
module.exports = mongoose;