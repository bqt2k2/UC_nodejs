const Progress = require('../../app/models/progress.model');
const Lesson = require('../models/lesson.model');
// Create new progress
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const progress = new Progress({
        IDNguoiDung: req.body.IDNguoiDung,
        IDKhoaHoc: req.body.IDKhoaHoc,
        IDBaiHoc: req.body.IDBaiHoc,
        ThoiGianHoanThanh: req.body.ThoiGianHoanThanh
    });

    Progress.create(progress, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while creating the progress."
            });
        else res.send(data);
    });
};

// đánh dấu bài học đã hoàn thành
exports.completeLesson = (req, res) => {
    const userId = req.session.user.IDNguoiDung;
    const { courseId, lessonId } = req.body;
    console.log('Saving progress...');
    Progress.completeLesson(userId, courseId, lessonId, (err, data) => {
        if (err) {
            console.error('Error completing lesson:', err);
            res.status(500).json({ message: "Internal Server Error" }); // Send JSON response
            return;
        }
        res.status(200).json({ message: 'Lesson completed successfully', status: 'hoàn thành' }); // Send JSON response
    });
};

exports.updateProgress = (req, res) => {
    const userId = req.session.user.IDNguoiDung;
    const { courseId, lessonId } = req.body;
    console.log('Updating progress...');
    Progress.updateProgress(userId, courseId, lessonId, (err, data) => {
        if (err) {
            console.error('Error updating progress:', err);
            res.status(500).json({ message: "Internal Server Error" });
            return;
        }
        res.status(200).json({ message: 'Progress updated successfully', status: data.status });
    });
};


// No need to separate saveProgress, as we only need to mark completion

//lưu tiến trình học
exports.saveProgress = (req, res) => {
    console.log('Saving progress 1');
    const userId = req.session.user.IDNguoiDung;
    const { courseId, lessonId, progress } = req.body;

    Progress.saveProgress(userId, courseId, lessonId, progress, (err, data) => {
        if (err) {
            console.error('Error saving progress:', err);
            res.status(500).send({ message: "Internal Server Error" });
            return;
        }
        res.status(200).send('Progress saved successfully');
    });
};
// Find progress by ID
exports.findOne = (req, res) => {
    Progress.findById(req.params.progressId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Progress with id ${req.params.progressId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Progress with id " + req.params.progressId
                });
            }
        } else res.send(data);
    });
};

// Retrieve all progress
exports.findAll = (req, res) => {
    Progress.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving progress."
            });
        else res.send(data);
    });
};

// Retrieve progress by user ID
exports.findByUserId = (req, res) => {
    Progress.findByUserId(req.params.userId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Progress for user id ${req.params.userId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Progress for user id " + req.params.userId
                });
            }
        } else res.send(data);
    });
};

// Retrieve progress by course ID
exports.findByCourseId = (req, res) => {
    Progress.findByCourseId(req.params.courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Progress for course id ${req.params.courseId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Progress for course id " + req.params.courseId
                });
            }
        } else res.send(data);
    });
};

// Update progress by ID
exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Progress.updateById(
        req.params.progressId,
        new Progress(req.body),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Progress with id ${req.params.progressId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Progress with id " + req.params.progressId
                    });
                }
            } else res.send(data);
        }
    );
};

// Delete progress by ID
exports.delete = (req, res) => {
    Progress.remove(req.params.progressId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Progress with id ${req.params.progressId}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Progress with id " + req.params.progressId
                });
            }
        } else res.send({ message: `Progress was deleted successfully!` });
    });
};

// Delete all progress
exports.deleteAll = (req, res) => {
    Progress.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while removing all progress."
            });
        else res.send({ message: `All Progress were deleted successfully!` });
    });
};

// Export the getLearningProgress function correctly
exports.getLearningProgress = (req, res) => {
    const { courseId, lessonId } = req.params;
    const user = req.session.user;

    if (!user) {
        return res.status(401).send({ message: "User not logged in." });
    }

    const userId = user.IDNguoiDung;

    Progress.findByUserCourse(userId, courseId, (err, progress) => {
        if (err) {
            console.error('Error retrieving progress:', err);
            return res.status(500).send({ message: "Error retrieving progress." });
        }
        if (progress) {
            // Redirect to the current lesson
            res.redirect(`/learning/${courseId}/${progress.IDBaiHoc}`);
        } else {
            // Redirect to the first lesson if no progress found
            Lesson.findFirstByCourse(courseId, (err, firstLesson) => {
                if (err) {
                    console.error('Error finding first lesson:', err);
                    return res.status(500).send({ message: "Error finding first lesson." });
                }
                res.redirect(`/learning/${courseId}/${firstLesson.IDBaiHoc}`);
            });
        }
    });
};

