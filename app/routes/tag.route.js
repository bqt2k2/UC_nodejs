const tagController = require('../controllers/tags.controller');

module.exports = app => {
    var router = require('express').Router();
    // Route to create a new tag
    router.post('/api/tags', tagController.createTag);

    // Route to update a tag
    router.put('/api/tags/:id', tagController.updateTag);

    // Route to delete a tag
    router.delete('/api/tags/:id', tagController.deleteTag);

    app.use('/', router);
};
