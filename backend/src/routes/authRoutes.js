const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPasswordRequest);
router.post('/update-password', authController.updatePassword);
router.get('/dashboard', authMiddleware, authController.getDashboardData);
router.post('/generate-tag', authMiddleware, authController.generateTag);
router.get('/scan/:tag_id', authController.getPublicProfile);
router.post('/update-location', authController.updateScanLocation);
router.post('/report-emergency', authController.updateScanLocation);
router.put('/update-profile', authMiddleware, authController.updateProfile);
router.post('/add-elder', authMiddleware, authController.addElder);

module.exports = router;