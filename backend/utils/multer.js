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
      fileSize: 1000000 * 5, // 5000000 Bytes = 5 MB
    },
    fileFilter(req, file, cb) {
      if (
        file.mimetype == "application/pdf" ||
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
      fileSize: 1000000 * 5, // 5000000 Bytes = 5 MB
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

};

module.exports = multerUpload;