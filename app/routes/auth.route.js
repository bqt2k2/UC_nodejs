const authController = require('../controllers/auth.controller');
module.exports = app => {
    var router = require('express').Router();
    
    // Route để hiển thị trang đăng nhập
    router.get('/login', authController.createLogin);

    // Route để xử lý gửi form đăng nhập
    router.post('/login', authController.login);

    // Route để hiển thị trang đăng ký
    router.get('/register', authController.createRegister);

    // Route để xử lý gửi form đăng ký
    router.post('/register', authController.register);

    // Route để xử lý đăng xuất
    router.post('/logout', authController.logout);

    // Route để xử lý xác nhận email
    router.get('/verify', authController.verify);

   // Route để hiển thị form quên mật khẩu
    router.get('/forgot', authController.showForgotPasswordForm); 

    // Route để gửi email chứa liên kết đặt lại mật khẩu
    router.post('/forgot', authController.sendResetLinkEmail);   
    
    // Route để hiển thị form đặt lại mật khẩu
    router.get('/password/reset', authController.showResetPasswordForm); 

    // Route để xử lý đặt lại mật khẩu
    router.post('/password/reset', authController.resetPassword,authController.logout); 

    app.use('/', router);
};
