const express = require('express');
const homeController = require('../controllers/home.controller');

module.exports = (app) => {
    const router = express.Router();
    router.get('/home', homeController.showHomePage);
    router.get('/courses', homeController.getCoursesByCategory); // Ensure this line is added
    router.get('/search', homeController.searchCourses); // Add this line for searching
    app.use('/', router);
};
