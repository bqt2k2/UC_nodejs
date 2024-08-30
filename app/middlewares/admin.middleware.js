// middleware/auth.js
exports.login = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    } else {
        return res.redirect('/admin/login');  // Ensure this path is correct
    }
};
