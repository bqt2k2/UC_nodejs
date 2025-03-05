const express = require('express');
const homeController = require('../controllers/home.controller');

module.exports = (app) => {
    const router = express.Router();
    
    router.get('/', homeController.showHomePage);
    router.get('/home', homeController.showHomePage); // Nếu muốn hỗ trợ cả /home
    router.get('/courses', homeController.getCoursesByCategory);
    router.get('/search', homeController.searchCourses);
    
    app.use('/', router);

};
