var multer_properties = {
    destination: function(res, file, cb) {
        cb(null, "./img"); // directory to save
    },
    filename: function(res, file, cb) {
        cb(null, file.originalname);
    }
};
module.exports = multer_properties;
