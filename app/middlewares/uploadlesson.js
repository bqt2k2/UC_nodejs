const multer = require('multer');
const path = require('path');

// Storage engine for lessons
const lessonStorage = multer.diskStorage({
    destination: 'app/public/course/lesson',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type function
function checkFileType(file, cb) {
    const videoTypes = /mp4|mov|avi|wmv/;
    const documentTypes = /docx/;
    const extname = videoTypes.test(path.extname(file.originalname).toLowerCase()) || 
                    documentTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = videoTypes.test(file.mimetype) || 
                     documentTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Only video and document files are allowed!'));
    }
}

// Initialize upload for lessons
const uploadLesson = multer({
    storage: lessonStorage,
    limits: { fileSize: 10000000000 }, // Limit size to 100MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = uploadLesson;
