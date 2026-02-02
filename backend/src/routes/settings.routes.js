const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { verifytoken, restrictto } = require('../middleware/auth.middleware');

// Security Settings - User can view/update their own
router.get('/security', verifytoken, settingsController.getSecuritySettings);
router.put('/security', verifytoken, settingsController.updateSecuritySettings);

// Notification Settings - User can view/update their own
router.get('/notifications', verifytoken, settingsController.getNotificationSettings);
router.put('/notifications', verifytoken, settingsController.updateNotificationSettings);

// Inventory Settings - User can view/update their own
router.get('/inventory', verifytoken, settingsController.getInventorySettings);
router.put('/inventory', verifytoken, settingsController.updateInventorySettings);

// Business Settings - Admin only (global settings)
router.get('/business', verifytoken, restrictto(['admin']), settingsController.getBusinessSettings);
router.put('/business', verifytoken, restrictto(['admin']), settingsController.updateBusinessSettings);

module.exports = router;