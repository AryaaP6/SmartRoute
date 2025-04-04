const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Route to get venues
router.post('/venues', apiController.getVenues);

// Route to get route
router.post('/route', apiController.getRoute);

module.exports = router;