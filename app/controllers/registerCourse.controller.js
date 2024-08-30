const Registration = require('../../app/models/registerCourse.model');
const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');
const Progress = require('../../app/models/progress.model');
// Tạo đăng ký mới
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Tạo đăng ký mới
    const registration = new Registration({
        IDNguoiDung: req.body.IDNguoiDung,
        IDKhoaHoc: req.body.IDKhoaHoc,
        ThoiGianDangKy: req.body.ThoiGianDangKy,
        TrangThai: req.body.TrangThai
    });

    // Lưu đăng ký vào database
    Registration.create(registration, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Registration."
            });
        else res.send(data);
    });
};
// xóa đăng kí khóa học của người dùng
exports.unregisterCourse = (req, res) => {
    const userId = req.session.user.IDNguoiDung;
    const courseId = req.params.id;

    Registration.unregister(userId, courseId, (err, data) => {
        if (err) {
            console.error('Error in unregistering course:', err);
            res.status(500).send({
                message: "Internal Server Error"
            });
            return;
        }
        res.status(200).send('Unregistered from course successfully');
    });
};

// Tìm đăng ký theo ID
exports.findOne = (req, res) => {
    Registration.findById(req.params.registrationId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Registration with id ${req.params.registrationId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Registration with id " + req.params.registrationId
                });
            }
        } else res.send(data);
    });
};

// Lấy tất cả đăng ký
exports.findAll = (req, res) => {
    Registration.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving registrations."
            });
        else res.send(data);
    });
};

// Lấy đăng ký theo ID người dùng
exports.findByUserId = (req, res) => {
    Registration.findByUserId(req.params.userId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Registrations for user id ${req.params.userId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Registrations for user id " + req.params.userId
                });
            }
        } else res.send(data);
    });
};

// Lấy đăng ký theo ID khóa học
exports.findByCourseId = (req, res) => {
    Registration.findByCourseId(req.params.courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Registrations for course id ${req.params.courseId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Registrations for course id " + req.params.courseId
                });
            }
        } else res.send(data);
    });
};

// Cập nhật đăng ký theo ID
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Registration.updateById(
        req.params.registrationId,
        new Registration(req.body),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Registration with id ${req.params.registrationId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Registration with id " + req.params.registrationId
                    });
                }
            } else res.send(data);
        }
    );
};

// Xóa đăng ký theo ID
exports.delete = (req, res) => {
    Registration.remove(req.params.registrationId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Registration with id ${req.params.registrationId}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Registration with id " + req.params.registrationId
                });
            }
        } else res.send({ message: `Registration was deleted successfully!` });
    });
};

// Xóa tất cả đăng ký
exports.deleteAll = (req, res) => {
    Registration.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while removing all registrations."
            });
        else res.send({ message: `All Registrations were deleted successfully!` });
    });
};

// ĐĂNG KÍ KHÓA HỌC
exports.registerCourse = (req, res) => {
    const IDKhoaHoc = req.params.courseId;
    const user = req.session.user;

    if (!user) {
        return res.status(401).send({ message: "User not logged in." });
    }

    const IDNguoiDung = user.IDNguoiDung;

    const newRegistration = {
        IDNguoiDung,
        IDKhoaHoc,
        ThoiGianDangKy: new Date(),
        // TrangThai: 'registered' tinh nang mua ban khoa hoc
    };

    Registration.create(newRegistration, (err, data) => {
        if (err) {
            console.error('Error registering for course:', err);
            return res.status(500).send({ message: "Error registering for course." });
        }
        Course.findById(IDKhoaHoc, (err, course) => {
            if (err) {
                console.error('Error finding course:', err);
                return res.status(500).send({ message: "Error finding course." });
            }
            if (!course) {
                return res.status(404).send({ message: "Course not found." });
            }
            Lesson.findByCourse(IDKhoaHoc, (err, lessons) => {
                if (err) {
                    console.error('Error finding lessons:', err);
                    return res.status(500).send({ message: "Error finding lessons." });
                }
                if (!lessons.length) {
                    console.log("No lessons found for this course.");
                    return res.status(404).send({ message: "No lessons found for this course." });
                }
                const currentLessonId = lessons[0].IDBaiHoc;
                res.render('courses/Learning', { 
                    course: course, 
                    lessons: lessons, // Pass the array of lessons
                    user: user,
                    courseId: IDKhoaHoc, // Pass the courseId
                    currentLessonId: currentLessonId
                });
            });
        });
    });
};
// học tiếp
exports.learningCourse = (req, res) => {
    const courseId = req.params.courseId;
    const user = req.session.user;

    if (!user) {
        return res.status(401).send({ message: "User not logged in." });
    }

    const userId = user.IDNguoiDung;

    Progress.getProgressByUserAndCourse(userId, courseId, (err, progress) => {
        if (err) {
            console.error('Error fetching progress:', err);
            return res.status(500).send({ message: "Error fetching progress." });
        }

        let currentLessonId = '';

        Course.findById(courseId, (err, course) => {
            if (err) {
                console.error('Error finding course:', err);
                return res.status(500).send({ message: "Error finding course." });
            }
            if (!course) {
                return res.status(404).send({ message: "Course not found." });
            }
            Lesson.findByCourse(courseId, (err, lessons) => {
                if (err) {
                    console.error('Error finding lessons:', err);
                    return res.status(500).send({ message: "Error finding lessons." });
                }
                if (!lessons.length) {
                    console.log("No lessons found for this course.");
                    return res.status(404).send({ message: "No lessons found for this course." });
                }

                if (progress) {
                    if (progress.TrangThaiHoanThanh === 'hoàn thành') {
                        currentLessonId = lessons[lessons.length - 1].IDBaiHoc;
                    } else if (progress.TrangThaiHoanThanh === 'đang học') {
                        currentLessonId = progress.IDBaiHoc;
                    }
                }

                // If no current lesson is found, default to the first lesson
                if (!currentLessonId) {
                    currentLessonId = lessons[0].IDBaiHoc;
                }

                res.render('courses/Learning', { 
                    course: course, 
                    lessons: lessons,
                    user: user,
                    courseId: courseId,
                    currentLessonId: currentLessonId // Pass the current lesson ID
                });
            });
        });
    });
};


// exports.getCourseDetails = (req, res) => {
//     const IDKhoaHoc = req.params.courseId;
//     const lessonId = req.params.lessonId;

//     Course.findById(IDKhoaHoc, (err, course) => {
//         if (err) {
//             console.error('Error finding course:', err);
//             return res.status(500).send({ message: "Error finding course." });
//         }
//         if (!course) {
//             return res.status(404).send({ message: "Course not found." });
//         }

//         Lesson.findById(IDKhoaHoc, (err, lessons) => {
//             if (err) {
//                 console.error('Error finding lessons:', err);
//                 return res.status(500).send({ message: "Error finding lessons." });
//             }
//             if (!lessons.length) {
//                 return res.status(404).send({ message: "No lessons found for this course." });
//             }

//             const currentLesson = lessons.find(lesson => lesson.IDBaiHoc == lessonId) || lessons[0];

//             res.render(`courses/Learning/${IDKhoaHoc}/${firstLesson.IDBaiHoc}`, {
//                 user: req.session.user,
//                 course,
//                 lessons,
//                 currentLesson
//             });
//         });
//     });
// };