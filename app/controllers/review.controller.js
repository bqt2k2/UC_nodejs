const Review = require('../models/review.model');

// Create a new review
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a new review
    const review = new Review({
        IDNguoiDung: req.session.user.IDNguoiDung,
        IDKhoaHoc: req.body.IDKhoaHoc,
        DiemDanhGia: req.body.DiemDanhGia,
        BinhLuan: req.body.BinhLuan
    });

    // Save review in the database
    Review.create(review, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Review."
            });
        else res.send({ success: true, data });
    });
};

// Retrieve all reviews for a course
exports.findAllByCourseId = (req, res) => {
    Review.findByCourseId(req.params.courseId, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving reviews."
            });
        } else res.send(data);
    });
};

// Retrieve the user's review for a course
exports.findUserReview = (req, res) => {
    const userId = req.session.user.IDNguoiDung;
    Review.findUserReview(req.params.courseId, userId, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving user review."
            });
        } else res.send({ yourReview: data });
    });
};

// Retrieve all other reviews for a course
exports.findOtherReviews = (req, res) => {
    const userId = req.session.user.IDNguoiDung;
    Review.findOtherReviews(req.params.courseId, userId, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving other reviews."
            });
        } else res.send({ otherReviews: data });
    });
};
// sua khoa hoc
exports.update = (req, res) => {
    console.log('Updating review by user ID and course ID');
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const userId = req.session.user.IDNguoiDung;
    const courseId = req.params.courseId;

    Review.updateByUserIdAndCourseId(userId, courseId, new Review(req.body), (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Review with user ID ${userId} and course ID ${courseId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Review with user ID " + userId + " and course ID " + courseId
                });
            }
        } else res.send({ success: true, data });
    });
};

// Xóa đánh giá theo ID người dùng và ID khóa học
exports.delete = (req, res) => {
    console.log('Xóa đánh giá');
    const userId = req.session.user.IDNguoiDung;
    const courseId = req.params.courseId;

    Review.removeByUserIdAndCourseId(userId, courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Không tìm thấy đánh giá với ID người dùng ${userId} và ID khóa học ${courseId}.`
                });
            } else {
                res.status(500).send({
                    message: `Không thể xóa đánh giá với ID người dùng ${userId} và ID khóa học ${courseId}.`
                });
            }
        } else res.send({ success: true, message: `Đánh giá đã được xóa thành công!` });
    });
};

