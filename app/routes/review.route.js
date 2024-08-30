const express = require('express');
const reviewController = require('../controllers/review.controller');

module.exports = app => {
    const router = express.Router();

    // Create a new review
    router.post('/reviews', reviewController.create);

    // Retrieve all reviews for a course
    router.get('/reviews/:courseId', reviewController.findAllByCourseId);

    // Retrieve the user's review for a course
    router.get('/reviews/:courseId/user', reviewController.findUserReview);

    // Retrieve all other reviews for a course
    router.get('/reviews/:courseId/others', reviewController.findOtherReviews);

    // Update a review by courseId
    router.put('/reviews/:courseId/edit', reviewController.update);

    // Delete a review by courseId
    router.delete('/reviews/:courseId/delete', reviewController.delete);

    // Use the router in the app
    app.use(router);
};
