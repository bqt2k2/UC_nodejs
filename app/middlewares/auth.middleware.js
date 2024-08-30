exports.loggedin = (req, res, next) => {
    if (req.session.loggedin) {
        res.locals.user = req.session.user;
        next();
    } else {
        res.locals.user = null;
        next();
    }
};

exports.isAuth = (req, res, next) => {
    if (req.session.loggedin) {
        res.locals.user = req.session.user;
        res.redirect('/home');
    } else {
        next();
    }
};

exports.requireAuth = (req, res, next) => {
    if (!req.session.loggedin) {
        res.redirect('/login');
    } else {
        next();
    }
};
