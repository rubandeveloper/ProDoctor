const multer = require("multer");
const path = require("path");
const fs = require("fs");

let storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname +
            "_" +
            new Date().getSeconds() +
            path.extname(file.originalname)
        );
    },
});

const multerUpload = {
    imageUpload: multer({
        storage: storage,
        limits: {
            fileSize: 100000000, // 1000000 Bytes = 1 MB
        },
        fileFilter(req, file, cb) {
            if (
                file.mimetype == "image/png" ||
                file.mimetype == "image/jpeg" ||
                file.mimetype == "image/jpg"
            ) {
                cb(undefined, true);
            } else {

                return cb(undefined, false);
            }
        },
    }),
    csvUpload: multer({
        storage: storage,
        limits: {
            fileSize: 1000000, // 1000000 Bytes = 1 MB
        },
        fileFilter(req, file, cb) {
            var ext = path.extname(file.originalname);
            console.log(ext);
            if (ext == '.csv' || ext == ".xlsx") {
                cb(null, true);
            } else {
                cb("Please upload only csv file.", false);
            }
        },
    }),
    notDocs: multer({
        limits: {
            fileSize: 5 * 1024 * 1024
        }, // 5MB file size limit
        fileFilter(req, file, cb) {
            if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png' && file.mimetype !== 'application/pdf') {
                return cb(undefined, false);
            } else {
                cb(null, true);
            }
        },
    }),
};

module.exports = multerUpload;
