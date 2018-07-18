var mongoose = require("./mongo");
var schemaAddGood = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    img: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    count: {
        type: Number
    }
});
var AddGood = mongoose.model("AddGood", schemaAddGood);
module.exports = AddGood;