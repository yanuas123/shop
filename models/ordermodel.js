var mongoose = require("./mongo");
var schemaOrderGood = new mongoose.Schema({
    idprod: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    qt: {
        type: Number,
        required: true
    }
});
var schemaAddOrder = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    user_id: {
        type: String
    },
    order: {
        type: [schemaOrderGood],
        required: true
    }
});
var AddOrder = mongoose.model("AddOrder", schemaAddOrder);
module.exports = AddOrder;