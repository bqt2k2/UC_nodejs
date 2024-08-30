const express = require('express');

module.exports = app => {
    require('./auth.route')(app);
    require('./home.route')(app);
    require('./course.route')(app);
    require('./lesson.route')(app);
    require('./review.route')(app);
    require('./registerCourse.route')(app);
    require('./category.route')(app);
    require('./profile.route')(app);
    require('./tag.route')(app);
    require('./admin.route')(app);
    require('./note.route')(app);
};
