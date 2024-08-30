
const registerCourseController = require('../controllers/registerCourse.controller');
const authMiddleware = require('../middlewares/auth.middleware')

const express = require('express');
module.exports = app => {
    var router = express.Router();
    router.post('/register',authMiddleware.loggedin, registerCourseController.create);
    router.delete('/courses/unregister/:id',authMiddleware.loggedin, registerCourseController.unregisterCourse);
// Register for course
router.get('/registerCourse/:courseId',authMiddleware.loggedin, registerCourseController.registerCourse);

// Continue learning
router.get('/learning/:courseId',authMiddleware.loggedin, registerCourseController.learningCourse);
    app.use(router);
};
