const Course = require('../models/course.model');
const User = require('../../app/models/auth.model');
const Category = require('../../app/models/category.model');
const Tag = require('../../app/models/tag.model');
const Review = require('../../app/models/review.model');
const Lesson = require('../../app/models/lesson.model');
const Admin = require('../../app/models/admin.model');
const { render } = require('ejs');


exports.getLogin = (req, res) => {
    res.render('admin/login', { loginError: null });
};

exports.postLogin = (req, res) => {
    const { email, password } = req.body;

    Admin.getAdmin(email, password, (err, admin) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.render('admin/login', { loginError: 'Invalid email or password.' });
            }
            return res.status(500).send('Server Error');
        }

        req.session.adminId = admin.IDAdmin;
        console.log('Session Admin ID:', req.session.adminId); // Log session ID
        res.redirect('/admin/home');
    });
};


exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
};
// trang chủ
exports.showAdmin = async (req, res) => {
    res.render('admin/home');
};
// khóa học dc nhiều đăng kí trong tuần qua
exports.getMostRegisteredThisWeek = (req, res) => {
    Course.getMostRegisteredThisWeek((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving the courses."
            });
        } else {
            res.send(data);
        }
    });
};
// khóa học dc đăng kí nhiều nhất
exports.getMostRegistered = (req, res) => {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    Course.getMostRegistered((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving the courses."
            });
        } else {
            const totalPages = Math.ceil(data.length / limit);
            const paginatedData = data.slice(offset, offset + limit);
            res.send({ courses: paginatedData, totalPages });
        }
    });
};
// những người dùng mới trong tuần qua 
exports.getUsersRegisteredThisWeek = (req, res) => {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    User.getUsersRegisteredThisWeek((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving the users."
            });
        } else {
            const totalPages = Math.ceil(data.length / limit);
            const paginatedData = data.slice(offset, offset + limit);
            res.send({ users: paginatedData, totalPages });
        }
    });
};
// show tất cả thông tin của tất cả khóa học
exports.getCourses = (req, res) => {
    const limit = parseInt(req.query.limit) || 5; // default to 5 if not provided
    const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
    const offset = (page - 1) * limit;

    Course.getCourses(limit, offset, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving courses."
            });
        } else {
            Course.getTotalCourses((err, totalCourses) => {
                if (err) {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving total courses."
                    });
                } else {
                    res.send({
                        courses: data,
                        totalPages: Math.ceil(totalCourses / limit)
                    });
                }
            });
        }
    });
};


// show tất cả người dùng 
exports.getPaginatedUsers = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    User.getUserInfo((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving users."
            });
            return;
        }

        const paginatedData = data.slice(offset, offset + limit);
        res.send({
            currentPage: page,
            totalPages: Math.ceil(data.length / limit),
            totalUsers: data.length,
            users: paginatedData
        });
    });
};
// thông tin chi  tiết của người dùng
exports.getUserDetails = (req, res) => {
    const userId = req.params.userId;

    // Fetch user details (assuming you have a function to get user details)
    User.findById(userId, (err, userData) => {
        if (err || !userData) {
            return res.status(500).send({
                message: err ? err.message : "User not found"
            });
        }

        // Fetch registered courses
        Course.getByUserId(userId, (err, registeredCourses) => {
            if (err) {
                return res.status(500).send({
                    message: err.message || "Error retrieving registered courses"
                });
            }

            // Fetch authored courses
            Course.getByAuthorId(userId, (err, authoredCourses) => {
                if (err) {
                    return res.status(500).send({
                        message: err.message || "Error retrieving authored courses"
                    });
                }

                // Fetch user comments and reviews
                Review.findByUserId(userId, (err, comments) => {
                    if (err) {
                        return res.status(500).send({
                            message: err.message || "Error retrieving comments"
                        });
                    }

                    // Combine all data into one response
                    const userDetail = {
                        ...userData,
                        KhoaHocDangKi: registeredCourses,
                        KhoaHocDangTai: authoredCourses,
                        BinhLuanDanhGia: comments
                    };

                    res.send(userDetail);
                });
            });
        });
    });
};
// xóa bình luận
exports.deleteReviewByUserAndCourse = (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    Review.removeByUserIdAndCourseId(userId, courseId, (err, data) => {
        if (err) {
            if (err.kind === 'not_found') {
                res.status(404).send({
                    message: `Review not found`
                });
            } else {
                res.status(500).send({
                    message: `Failed to delete review.`
                });
            }
        } else {
            res.status(200).send({ message: `Review deleted successfully` });
        }
    });
};


// cập nhật danh mục và tag của khóa học
exports.updateCategoryAndTags = (req, res) => {
    // Validate request
    if (!req.body.category || !req.body.tags) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const courseId = req.params.courseId;
    const category = req.body.category;
    const tags = req.body.tags;

    // Update category
    Course.updateCategory(courseId, category, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Course with id ${courseId}.`
                });
                return;
            }
            res.status(500).send({
                message: `Error updating category for Course with id ${courseId}`
            });
            return;
        }

        // Update tags
        Course.updateTags(courseId, tags, (err, data) => {
            if (err) {
                res.status(500).send({
                    message: `Error updating tags for Course with id ${courseId}`
                });
                return;
            }

            res.send(data);
        });
    });
};
// thong tin  chi tiet khoa hoc va bai hoc
exports.getCourseDetails = (req, res) => {
    const courseId = req.params.id;

    Course.findById(courseId, (err, course) => {
        if (err || !course) {
            return res.status(404).send('Course not found');
        }

        Lesson.findByCourseId(courseId, (lessonErr, lessons) => {
            if (lessonErr) {
                console.error('Error fetching lessons:', lessonErr);
                return res.status(500).send('Internal Server Error');
            }

            Category.getAll((categoryErr, categories) => {
                if (categoryErr) {
                    console.error('Error fetching categories:', categoryErr);
                    return res.status(500).send('Internal Server Error');
                }

                Tag.getByCourseId(courseId, (courseTagErr, courseTags) => {
                    if (courseTagErr) {
                        console.error('Error fetching course tags:', courseTagErr);
                        return res.status(500).send('Internal Server Error');
                    }

                    Review.findByCourseId(courseId, (reviewErr, reviews) => {
                        if (reviewErr) {
                            console.error('Error fetching reviews:', reviewErr);
                            return res.status(500).send('Internal Server Error');
                        }

                        res.send({
                            course,
                            lessons,
                            categories,
                            courseTags,
                            reviews
                        });
                    });
                });
            });
        });
    });
};

// thông tin nội dung bài học
exports.getLessonDetails = (req, res) => {
    const lessonId = req.params.id;
    console.log('Fetching lesson details for ID:', lessonId);

    Lesson.findById(lessonId, (err, lesson) => {
        if (err || !lesson) {
            return res.status(404).send('Lesson not found');
        }

        res.send({
            lesson
        });
    });
};

// quản lí danh mục
//show danh mục
exports.getPaginatedCategories = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    Category.getPaginated(limit, offset, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving categories."
            });
            return;
        }

        Category.getTotalCount((err, count) => {
            if (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving total count of categories."
                });
                return;
            }

            res.send({
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalCategories: count,
                categories: data
            });
        });
    });
};
// quản lí thể 
// Lấy tất cả tags với phân trang
exports.getAllTags = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    Tag.getAll({ limit, offset }, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tags."
            });
            return;
        }
        Tag.countAll((err, totalItems) => {
            if (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while counting tags."
                });
                return;
            }
            const totalPages = Math.ceil(totalItems / limit);
            res.send({
                tags: data,
                totalItems,
                totalPages,
                currentPage: page
            });
        });
    });
};
