const express = require('express');
const noteController = require('../controllers/note.controller');

module.exports = app => {
    const router = express.Router();

    // Retrieve the user's note for a course
    router.get('/notes/:courseId/user', noteController.findUserNote);

    // Update or create a note by courseId
    router.put('/notes/:courseId', noteController.updateOrCreate);

    // Use the router in the app
    app.use(router);
};
