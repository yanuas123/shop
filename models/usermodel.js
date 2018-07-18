var mongoose = require('./mongo');
var schemaUsert = new mongoose.Schema({
    id: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String
    }
});
var Usert = mongoose.model("Usert", schemaUsert);
module.exports = Usert;