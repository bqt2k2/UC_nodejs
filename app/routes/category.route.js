const categoryController = require('../controllers/category.controller');

module.exports = app => {
    var router = require('express').Router();
    // Route to create a new category
    router.post('/api/categories', categoryController.createCategory);

    // Route to update a category
    router.put('/api/categories/:id', categoryController.updateCategory);

    // Route to delete a category
    router.delete('/api/categories/:id', categoryController.deleteCategory);
    app.use('/', router);
};
