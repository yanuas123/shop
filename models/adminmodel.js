var mongoose = require("./mongo");
var schemaAddAdmin = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
var AddAdmin = mongoose.model("AddAdmin", schemaAddAdmin);
module.exports = AddAdmin;