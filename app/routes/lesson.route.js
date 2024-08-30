const express = require('express');
const lessonController = require('../controllers/lesson.controller');
const uploadLesson = require('../middlewares/uploadlesson');
const authMiddleware = require('../middlewares/auth.middleware')
const registerCourse = require('../controllers/registerCourse.controller')
const progressController = require('../controllers/progress.controller')
module.exports = app => {
    const router = express.Router();

    // Route for displaying the upload lesson page
    router.get('/lessons/upload', lessonController.showlesson);

// Route để xử lý tải lên bài học
router.post('/lessons/upload',authMiddleware.loggedin, uploadLesson.single('lessonFile'), lessonController.create);

    // Route to display the edit lesson page
    router.get('/lessons/:lessonId/edit', lessonController.showeditlesson);

    // Route to update a lesson by ID
    router.put('/lessons/:lessonId',authMiddleware.loggedin, uploadLesson.single('lessonVideo'), lessonController.update);

    // Route to delete a lesson by ID
    router.delete('/lessons/:lessonId', lessonController.delete);


    // router.get('/registerCourse/:courseId', registerCourse.registerCourse);
    // router.get('/learning/:courseId/:lessonId', progressController.getLearningProgress);

    // router.post('/progress',authMiddleware.loggedin, progressController.saveProgress);

    router.post('/complete-lesson', authMiddleware.loggedin, progressController.completeLesson);
    router.post('/update-progress', authMiddleware.loggedin, progressController.updateProgress);


    app.use(router);
};
