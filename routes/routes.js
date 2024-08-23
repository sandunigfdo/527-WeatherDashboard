const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Weather Dashboard', // Title for the main page
        // You can add more data here to pass to the handlebars template
    });
});

module.exports = router;
