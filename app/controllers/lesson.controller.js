const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const Progress = require('../models/progress.model');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
// Display the upload lesson page
exports.showlesson = (req, res) => {
    const user = req.session.user;
    const courseId = req.query.courseId;
    const currentUrl = req.originalUrl;

    Lesson.findByCourseId(courseId, (err, lessons) => {
        if (err) {
            if (err.kind === 'not_found') {
                return res.render('courses/uploadLesson', { IDKhoaHoc: courseId, user: user, lessons: [], currentUrl: currentUrl, lesson: null });
            } else {
                return res.status(500).send({
                    message: err.message || "Some error occurred while retrieving the lessons."
                });
            }
        }
        res.render('courses/uploadLesson', { IDKhoaHoc: courseId, user: user, lessons: lessons, currentUrl: currentUrl, lesson: null });
    });
};


// Display the edit lesson page
exports.showeditlesson = (req, res) => {
    const user = req.session.user;
    const lessonId = req.params.lessonId;
    const currentUrl = req.originalUrl;
    const courseId = req.query.courseId;

    Lesson.findById(lessonId, (err, lesson) => {
        if (err) {
            return res.status(500).send({
                message: err.message || `Error retrieving Lesson with id ${lessonId}`
            });
        }
        if (!lesson) {
            return res.status(404).send({
                message: `Lesson with id ${lessonId} not found.`
            });
        }
        Lesson.findByCourseId(lesson.IDKhoaHoc, (err, lessons) => {
            if (err) {
                return res.status(500).send({
                    message: err.message || "Some error occurred while retrieving the lessons."
                });
            }
            res.render('courses/editLesson', { lesson: lesson, user: user, lessons: lessons, currentUrl: currentUrl, IDKhoaHoc: courseId });
        });
    });
};

// Create a new lesson
exports.create = (req, res) => {
    const { lessonName, lessonDescription, lessonType, lessonOrder, courseId } = req.body;
    let fileContent = req.body.editLesson; // Adjust based on form input name

    const createLesson = (fileContent) => {
        const lesson = new Lesson({
            TenBaiHoc: lessonName,
            MoTaBaiHoc: lessonDescription,
            FileBaiHoc: fileContent,
            LoaiBaiHoc: lessonType,
            ThuTuBaiHoc: lessonOrder,
            IDKhoaHoc: courseId
        });

        Lesson.create(lesson, (err, data) => {
            if (err) {
                return res.status(500).send({
                    message: err.message || "Some error occurred while creating the Lesson."
                });
            } else {
                // Update course status to "Đang chờ duyệt"
                Course.updateStatusById(courseId, 'Đang chờ duyệt', (err, data) => {
                    if (err) {
                        return res.status(500).send({
                            message: "Error updating course status."
                        });
                    } else {
                        res.redirect(`/lessons/upload?courseId=${courseId}`);
                    }
                });
            }
        });
    };

    // Handle Word document upload and conversion
    if (req.file && req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const buffer = req.file.buffer;
        mammoth.extractRawText({ buffer: buffer })
            .then(result => {
                fileContent = result.value;
                createLesson(fileContent);
            })
            .catch(err => {
                console.error('Error processing file:', err);
                res.status(500).send('Error processing file.');
            });
    } else if (req.file) {
        fileContent = req.file.filename; // For other file types (e.g., videos), handle accordingly
        createLesson(fileContent);
    } else {
        createLesson(fileContent); // If no file uploaded, proceed with current content
    }
};


// Cập nhật bài học bằng ID
exports.update = (req, res) => {
    const lessonId = req.params.lessonId;
    const { lessonName, lessonDescription, lessonType, lessonOrder, courseId } = req.body;
    let fileContent = req.body.editLesson;
    const lessonVideoPath = req.body.lessonVideoPath;

    const updateLesson = (fileContent) => {
        const lesson = new Lesson({
            IDBaiHoc: lessonId,
            TenBaiHoc: lessonName,
            MoTaBaiHoc: lessonDescription,
            FileBaiHoc: fileContent,
            LoaiBaiHoc: lessonType,
            ThuTuBaiHoc: lessonOrder,
            IDKhoaHoc: courseId
        });

        Lesson.updateById(lessonId, lesson, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Lesson with id ${lessonId} not found.`
                    });
                } else {
                    return res.status(500).send({
                        message: "Error updating Lesson with id " + lessonId
                    });
                }
            } else {
                // Update course status to "Đang chờ duyệt"
                Course.updateStatusById(courseId, 'Đang chờ duyệt', (err, data) => {
                    if (err) {
                        res.status(500).send({
                            message: "Error updating course status."
                        });
                    } else {
                        res.redirect(`/lessons/upload?courseId=${courseId}`);
                    }
                });
            }
        });
    };

    if (req.file && req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const buffer = req.file.buffer;
        mammoth.extractRawText({ buffer: buffer })
            .then(result => {
                fileContent = result.value;
                updateLesson(fileContent);
            })
            .catch(err => {
                console.error('Error processing file:', err);
                res.status(500).send('Error processing file.');
            });
    } else if (req.file && req.file.mimetype.startsWith('video/')) {
        fileContent = req.file.filename;
        updateLesson(fileContent);
    } else if (req.file) {
        fileContent = req.file.filename;
        // Kiểm tra và loại bỏ thẻ <p> nếu tồn tại
        if (fileContent.startsWith('<p>') && fileContent.endsWith('</p>')) {
            fileContent = fileContent.slice(3, -4);
        }
        updateLesson(fileContent);
    } else {
        if (lessonType === 'video' && lessonVideoPath) {
            fileContent = lessonVideoPath;
            // Kiểm tra và loại bỏ thẻ <p> nếu tồn tại
            if (fileContent.startsWith('<p>') && fileContent.endsWith('</p>')) {
                fileContent = fileContent.slice(3, -4);
            }
        }
        updateLesson(fileContent);
    }
};

// Delete a lesson by ID
exports.delete = (req, res) => {
    const lessonId = req.params.lessonId;

    // First remove progress by lesson id
    Progress.removeByLessonId(lessonId, (err, progressData) => {
        if (err && err.kind !== "not_found") {
            // If there is an error other than "not_found", return error
            return res.status(500).send({
                message: "Could not delete progress for lesson with id " + lessonId
            });
        }

        // Proceed to delete the lesson
        Lesson.remove(lessonId, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Lesson with id ${lessonId} not found.`
                    });
                } else {
                    return res.status(500).send({
                        message: "Could not delete Lesson with id " + lessonId
                    });
                }
            } else {
                res.status(200).send({ message: 'Lesson deleted successfully.' });
            }
        });
    });
};