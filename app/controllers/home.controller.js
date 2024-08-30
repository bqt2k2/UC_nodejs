const Category = require('../models/category.model');
const Course = require('../models/course.model');

exports.showHomePage = async (req, res) => {
    try {
        Category.getAll((err, categories) => {
            if (err) {
                console.error('Error fetching categories:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            Course.getAllApproved((err, courses) => {
                if (err) {
                    console.error('Error fetching courses:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                res.render('home', {
                    user: req.session.user || null,
                    categories: categories,
                    courses: courses
                });
            });
        });
    } catch (error) {
        console.error('Error fetching home page data:', error);
        res.status(500).send('Internal Server Error');
    }
};


// Add this method to handle filtering courses by category
// Add this method to handle filtering courses by category
exports.getCoursesByCategory = async (req, res) => {
    const categoryId = req.query.categoryId;
    if (!categoryId) {
        res.status(400).send('Category ID is required');
        return;
    }

    try {
        Course.getByCategoryId(categoryId, (err, courses) => {
            if (err) {
                console.error('Error fetching courses by category:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(courses);
        });
    } catch (error) {
        console.error('Error fetching courses by category:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Add this method to handle searching courses
exports.searchCourses = async (req, res) => {
    const query = req.query.query;
    if (!query) {
        res.status(400).send('Search query is required');
        return;
    }

    try {
        Course.searchApproved(query, (err, courses) => {
            if (err) {
                console.error('Error searching courses:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(courses);
        });
    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).send('Internal Server Error');
    }
};
