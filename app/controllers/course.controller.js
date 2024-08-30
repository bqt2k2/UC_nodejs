const Course = require('../../app/models/course.model');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Category = require('../../app/models/category.model')
const Tag = require('../../app/models/tag.model')
const Lesson = require('../../app/models/lesson.model')
const Review = require('../../app/models/review.model')
const Registration = require('../../app/models/registerCourse.model')
const Progress = require('../../app/models/progress.model')
const Note = require('../../app/models/note.model')
//hiển thị trang khóa học
exports.createCourse = async (req, res) => {
    try {
        const user = req.session.user; // Ensure session middleware is set up correctly
        Category.getAll((err, categories) => {
            if (err) {
                console.error('Error fetching categories:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.render('courses/uploadCourse', { user, categories });

        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
};
// Gợi ý khóa học dựa trên ID khóa học đã hoàn thành
exports.suggestCourses = (req, res) => {
    const completedCourseId = req.params.id;
    Course.getSuggestions(completedCourseId, (err, data) => {
        if (err) {
            res.status(500).send({
                message: "Error retrieving suggestions for course with id " + completedCourseId
            });
        } else{ 
            console.log("GỢI Y KHOA HOC " + data);
            res.send(data);
        }
    });
};

// hiện gợi ý tag khi tạo khóa học
exports.getTags = (req, res) => {
    try {
        const searchTerm = req.query.q;
        Tag.findAll(searchTerm, (err, tags) => {
            if (err) {
                console.error('Error fetching tags:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(tags.map(tag => ({
                id: tag.IDTag,
                name: tag.TenTag
            })));
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).send('Internal Server Error');
    }
};
// show trang edit khóa học
exports.editCoursePage = (req, res) => {
    const user = req.session.user;
    const courseId = req.params.courseId;

    Course.findById(courseId, (err, course) => {
        if (err || !course) {
            return res.status(404).send('Course not found');
        }

        Lesson.findByCourseId(courseId, (lessonErr, lessons) => {
            if (lessonErr && lessonErr.kind === "not_found") {
                lessons = [];
            } else if (lessonErr) {
                console.error('Error fetching lessons:', lessonErr);
                return res.status(500).send('Internal Server Error');
            }

            Category.getAll((categoryErr, categories) => {
                if (categoryErr) {
                    console.error('Error fetching categories:', categoryErr);
                    return res.status(500).send('Internal Server Error');
                }

                Tag.getAlll((tagErr, tags) => {
                    if (tagErr) {
                        console.error('Error fetching tags:', tagErr);
                        return res.status(500).send('Internal Server Error');
                    }

                    Tag.getByCourseId(courseId, (courseTagErr, courseTags) => {
                        if (courseTagErr) {
                            console.error('Error fetching course tags:', courseTagErr);
                            return res.status(500).send('Internal Server Error');
                        }
                        res.render('courses/editCourse', { user, course, categories, lessons, tags, courseTags });
                    });
                });
            });
        });
    });
};





// Tạo khóa học mới
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    // Check file upload
    let uploadedFilePath = '';
    if (req.file) {
        console.log('File uploaded successfully:', req.file);
        // Correctly set the file path
        uploadedFilePath = path.join('/course/avatar', path.basename(req.file.path));
    } else {
        console.log('No file uploaded');
    }

    // Create a new course
    const user = req.session.user;
    const course = {
        TenKhoaHoc: req.body.TenKhoaHoc,
        MoTaKhoaHoc: req.body.MoTaKhoaHoc,
        AnhKhoaHoc: uploadedFilePath,
        TrangThaiKhoaHoc: 'Đang chờ duyệt',
        IDDanhMuc: req.body.IDDanhMuc,
        IDNguoiTao: user.IDNguoiDung    
    };
    console.log("tac gia "+course.IDNguoiTao);
    // Save the course to the database
    Course.create(course, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while creating the Course."
            });
        }

        // Handle tags if provided
        const courseId = data.IDKhoaHoc;
        const tags = req.body.Tags; // Assume this is an array of tag IDs

        if (tags && tags.length > 0) {
            const values = tags.map(tagId => [courseId, tagId]);
            Tag.addCourseTags(values, (err, result) => {
                if (err) {
                    return res.status(500).send({
                        message: err.message || "Some error occurred while adding tags to the Course."
                    });
                }
                // Redirect to uploadLesson page with course ID
                res.redirect(`/lessons/upload?courseId=${courseId}`);
            });
        } else {
            // Redirect to uploadLesson page with course ID
            res.redirect(`/lessons/upload?courseId=${courseId}`);
        }
    });
};

// Tìm khóa học theo ID
exports.findOne = (req, res) => {
    Course.findById(req.params.courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Course with id ${req.params.courseId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Course with id " + req.params.courseId
                });
            }
        } else res.send(data);
    });
};

// Lấy tất cả khóa học
exports.findAll = (req, res) => {
    Course.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving courses."
            });
        else res.send(data);
    });
};

// Cập nhật khóa học theo ID
exports.update = (req, res) => {
    console.log('Updating course');
    if (!req.body) {
        return res.status(400).send({ message: "Content cannot be empty!" });
    }
    
    const courseId = req.params.courseId;
    const user = req.session.user;
    
    if (!user || !user.IDNguoiDung) {
        return res.status(401).send({ message: "User not authenticated!" });
    }
    
    const updatedCourse = {
        TenKhoaHoc: req.body.TenKhoaHoc,
        MoTaKhoaHoc: req.body.MoTaKhoaHoc,
        TrangThaiKhoaHoc: 'Đang chờ duyệt',
        IDDanhMuc: req.body.IDDanhMuc,
        IDNguoiTao: user.IDNguoiDung
    };

    if (req.file) {
        console.log('File uploaded successfully:', req.file);
        updatedCourse.AnhKhoaHoc = path.join('/course/avatar', path.basename(req.file.path));
    } else {
        console.log('No file uploaded');
    }

    Course.updateById(courseId, updatedCourse, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while updating the Course."
            });
        }

        const tags = req.body.Tags; 

        if (tags && tags.length > 0) {
            const values = tags.map(tagId => [courseId, tagId]);
            Tag.updateCourseTags(courseId, values, (err, result) => {
                if (err) {
                    return res.status(500).send({
                        message: err.message || "Some error occurred while updating tags for the Course."
                    });
                }
                res.redirect('/profile');
            });
        } else {
            res.redirect('/profile');
        }
    });
};

// Xóa khóa học theo ID
exports.delete = (req, res) => {
    const courseId = req.params.courseId;

    console.log(`Attempting to delete course with id: ${courseId}`);

    // First, delete all registrations related to the course
    Registration.remove(courseId, (err, data) => {
        if (err && err.kind !== "not_found") {
            console.error(`Error deleting registrations for course id ${courseId}:`, err);
            return res.status(500).send({
                message: "Could not delete Registrations with course id " + courseId
            });
        }

        console.log(`Registrations for course id ${courseId} deleted successfully or none existed.`);

        // Then, delete all progress related to the course
        Progress.removeByCourseId(courseId, (err, data) => {
            if (err && err.kind !== "not_found") {
                console.error(`Error deleting progress for course id ${courseId}:`, err);
                return res.status(500).send({
                    message: "Could not delete Progress with course id " + courseId
                });
            }

            console.log(`Progress for course id ${courseId} deleted successfully or none existed.`);

            // Then, delete all lessons related to the course
            Lesson.removeByCourseId(courseId, (err, data) => {
                if (err && err.kind !== "not_found") {
                    console.error(`Error deleting lessons for course id ${courseId}:`, err);
                    return res.status(500).send({
                        message: "Could not delete Lessons with course id " + courseId
                    });
                }

                console.log(`Lessons for course id ${courseId} deleted successfully or none existed.`);

                // Then, delete all tags related to the course
                Tag.deleteCourseTagsByCourseId(courseId, (err, data) => {
                    if (err && err.kind !== "not_found") {
                        console.error(`Error deleting tags for course id ${courseId}:`, err);
                        return res.status(500).send({
                            message: "Could not delete Tags with course id " + courseId
                        });
                    }

                    console.log(`Tags for course id ${courseId} deleted successfully or none existed.`);

                    // Then, delete all notes related to the course
                    Note.deleteByCourseId(courseId, (err, data) => {
                        if (err && err.kind !== "not_found") {
                            console.error(`Error deleting notes for course id ${courseId}:`, err);
                            return res.status(500).send({
                                message: "Could not delete Notes with course id " + courseId
                            });
                        }

                        console.log(`Notes for course id ${courseId} deleted successfully or none existed.`);

                        // Then, delete all reviews related to the course
                        Review.removeAllByCourseId(courseId, (err, data) => {
                            if (err && err.kind !== "not_found") {
                                console.error(`Error deleting reviews for course id ${courseId}:`, err);
                                return res.status(500).send({
                                    message: "Could not delete Reviews with course id " + courseId
                                });
                            }

                            console.log(`Reviews for course id ${courseId} deleted successfully or none existed.`);

                            // Finally, delete the course itself
                            Course.remove(courseId, (err, data) => {
                                if (err) {
                                    if (err.kind === "not_found") {
                                        console.warn(`Course with id ${courseId} not found.`);
                                        return res.status(404).send({
                                            message: `Not found Course with id ${courseId}.`
                                        });
                                    } else {
                                        console.error(`Error deleting course with id ${courseId}:`, err);
                                        return res.status(500).send({
                                            message: "Could not delete Course with id " + courseId
                                        });
                                    }
                                } else {
                                    console.log(`Course with id ${courseId} deleted successfully.`);
                                    res.send({ message: `Course was deleted successfully!` });
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};

// Xóa tất cả khóa học
exports.deleteAll = (req, res) => {
    Course.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while removing all courses."
            });
        else res.send({ message: `All Courses were deleted successfully!` });
    });
};

// Thêm danh mục cho khóa học
exports.addCategory = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Thêm danh mục vào khóa học
    const courseCategory = {
        IDKhoaHoc: req.body.IDKhoaHoc,
        IDDanhMuc: req.body.IDDanhMuc
    };

    Course.addCategory(courseCategory, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while adding the category to the Course."
            });
        else res.send(data);
    });
};

// Tìm danh mục theo ID khóa học
exports.getCategoryByCourseId = (req, res) => {
    Course.getCategoryByCourseId(req.params.courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Category with course id ${req.params.courseId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Category with course id " + req.params.courseId
                });
            }
        } else res.send(data);
    });
};

// Hiển thị thông tin chi tiết khóa học
exports.getCourseInfo = (req, res) => {
    const courseId = req.params.courseId;
    const user = req.session.user;
    
    Course.findById(courseId, (err, course) => {
        if (err) {
            console.error('Error fetching course info:', err);
            return res.status(500).send('Server error');
        }

        if (!course) {
            return res.status(404).send('Course not found');
        }

        Review.findByCourseId(courseId, (err, reviews) => {
            if (err) {
                console.error('Error fetching reviews:', err);
                return res.status(500).send('Server error');
            }

            Lesson.findByCourseId(courseId, (err, lessons) => {
                if (err) {
                    console.error('Error fetching lessons:', err);
                    return res.status(500).send('Server error');
                }

                if (user) {
                    Registration.findByCourseAndUser(courseId, user.IDNguoiDung, (err, registration) => {
                        if (err) {
                            console.error('Error checking registration:', err);
                            return res.status(500).send('Server error');
                        }

                        const registered = !!registration;
                        console.log('Rendering course info for user:', user.IDNguoiDung);

                        res.render('courses/courseInfo', { 
                            course: course, 
                            reviews: reviews,
                            lessons: lessons,
                            user: user,
                            registered: registered
                        });
                    });
                } else {
                    console.log('Rendering course info for guest user');
                    res.render('courses/courseInfo', { 
                        course: course, 
                        reviews: reviews,
                        lessons: lessons,
                        user: user,
                        registered: false
                    });
                }
            });
        });
    });
};
// quản lí 
//cập nhật trạng thái khóa học
exports.updateApprovalStatus = (req, res) => {
    const courseId = req.params.id;
    const { status } = req.body;

    Course.updateStatus(courseId, status, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Course with id ${courseId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Course with id " + courseId
                });
            }
        } else res.send(data);
    });
};

exports.updateCourseDetails = (req, res) => {
    const courseId = req.params.id;
    const updatedCourse = {
        IDDanhMuc: req.body.IDDanhMuc,
        Tags: req.body.Tags // Assuming you have some logic to handle tags update
    };

    Course.updateByIdAdmin(courseId, updatedCourse, (err, data) => {
        if (err) {
            console.error('Error updating course:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send(data);
    });
};
