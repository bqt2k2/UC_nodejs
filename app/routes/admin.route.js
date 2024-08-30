const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/admin.middleware');
module.exports = (app) => {
    const router = express.Router();
    router.get('/admin/home',authMiddleware.login, adminController.showAdmin);

    // Route to get most registered courses of the week
    router.get('/api/courses/top-weekly', adminController.getMostRegisteredThisWeek);

    // Route to get most registered courses with pagination
    router.get('/api/courses/top', adminController.getMostRegistered);

    // Route to get new users registered in the past week with pagination
    router.get('/api/users/new', adminController.getUsersRegisteredThisWeek);

    // Route to get all courses with pagination
    router.get('/api/courses', adminController.getCourses);
    // Route to get paginated user data
    router.get('/api/users', adminController.getPaginatedUsers);
    // Route to get paginated categories
    router.get('/api/categories', adminController.getPaginatedCategories);
    // Route to get all tags with pagination
    router.get('/api/tags', adminController.getAllTags);
    // Route to get detailed information about a user including their registered and authored courses
    router.get('/api/user/:userId', adminController.getUserDetails);
    // Route to get course details and lessons
    router.get('/api/courses/:id', adminController.getCourseDetails);
    // show nội dung bài học
    router.get('/api/lessons/:id', adminController.getLessonDetails);
    // xóa bình luận
    router.delete('/api/reviews/:courseId/:userId', adminController.deleteReviewByUserAndCourse);
    // đăng nhập
    router.get('/admin/login', adminController.getLogin);
    router.post('/admin/login', adminController.postLogin);
    router.get('/admin/logout', adminController.logout);
    app.use('/', router);
};
