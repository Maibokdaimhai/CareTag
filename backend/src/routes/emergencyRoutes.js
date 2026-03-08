const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const userController = require('../controllers/userController.js')

router.post('/report-emergency', emergencyController.reportEmergency);
router.get('/elder-info/:slug', emergencyController.getElderInfo);

router.post('/register', userController.registerElder);

module.exports = router;