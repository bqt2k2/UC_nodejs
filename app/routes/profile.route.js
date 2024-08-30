const express = require('express');
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const upload = require('../middlewares/uploadavatar');
module.exports = (app) =>{
    var router = express.Router();
    router.get('/profile',authMiddleware.loggedin, authController.createProfile );
    router.post('/update-info', authMiddleware.loggedin, upload.single('avatar'), authController.updateProfile);
    app.use('/', router);
};