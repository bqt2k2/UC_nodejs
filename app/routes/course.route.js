const express = require('express');
const courseController = require('../controllers/course.controller');
const uploadAvatar = require('../middlewares/uploadcourseavatar');

module.exports = (app) => {
    const router = express.Router();

    router.get('/uploadCourse', courseController.createCourse);
    router.get('/tags', courseController.getTags);
    router.post('/createcourse', uploadAvatar.single('AnhKhoaHoc'), courseController.create);
    router.delete('/courses/:courseId', courseController.delete);
    router.get('/editCourse/:courseId', courseController.editCoursePage);
    router.put('/courses/:courseId', uploadAvatar.single('AnhKhoaHoc'), courseController.update);
    router.get('/courseInfo/:courseId', courseController.getCourseInfo);
    router.put('/update-status/:id', courseController.updateApprovalStatus);
    router.put('/admin/courses/:id', courseController.updateCourseDetails);
    // gợi ý khóa học
    router.get('/course-suggestions/:id', courseController.suggestCourses);

    app.use('/', router);
};
