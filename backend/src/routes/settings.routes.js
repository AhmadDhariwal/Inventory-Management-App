const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { verifytoken, restrictto } = require('../middleware/auth.middleware');

// Security Settings - restricted to admin/manager
router.get('/security', verifytoken, restrictto(['admin', 'manager']), settingsController.getSecuritySettings);
router.put('/security', verifytoken, restrictto(['admin', 'manager']), settingsController.updateSecuritySettings);

// Notification Settings - restricted to admin/manager
router.get('/notifications', verifytoken, restrictto(['admin', 'manager']), settingsController.getNotificationSettings);
router.put('/notifications', verifytoken, restrictto(['admin', 'manager']), settingsController.updateNotificationSettings);

// Inventory Settings - restricted to admin/manager
router.get('/inventory', verifytoken, restrictto(['admin', 'manager']), settingsController.getInventorySettings);
router.put('/inventory', verifytoken, restrictto(['admin', 'manager']), settingsController.updateInventorySettings);

// Business Settings - Admin only (global settings)
router.get('/business', verifytoken, restrictto(['admin']), settingsController.getBusinessSettings);
router.put('/business', verifytoken, restrictto(['admin']), settingsController.updateBusinessSettings);

module.exports = router;