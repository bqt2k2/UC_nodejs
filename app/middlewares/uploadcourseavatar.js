const multer = require('multer');
const path = require('path');

// Storage engine for avatars
const avatarStorage = multer.diskStorage({
    destination: 'app/public/course/avatar',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type function
function checkFileType(file, cb, type) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(`Error: Only ${type} files are allowed!`));
    }
}

// Initialize upload for avatars
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 1000000 }, // Limit size to 1MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb, 'image');
    }
});

module.exports = uploadAvatar;
