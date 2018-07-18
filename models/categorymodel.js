var mongoose = require("./mongo");
var schemaAddCtgr = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    }
});
var AddCtgr = mongoose.model("AddCtgr", schemaAddCtgr);
module.exports = AddCtgr;