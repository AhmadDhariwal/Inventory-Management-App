const express = require('express');
const router = express.Router();
const notificationService = require('../services/notification.service');
const { verifytoken } = require('../middleware/auth.middleware');

// Get paginated notifications
router.get('/', verifytoken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await notificationService.getNotifications(req.userid, req.organizationId, page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark single notification as read
router.patch('/:id/read', verifytoken, async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.userid, req.organizationId);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark all as read
router.post('/mark-all-read', verifytoken, async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.userid, req.organizationId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete a notification
router.delete('/:id', verifytoken, async (req, res) => {
    try {
        const result = await notificationService.deleteNotification(req.params.id, req.userid, req.organizationId);
        if (!result) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Clear all notifications
router.delete('/', verifytoken, async (req, res) => {
    try {
        await notificationService.clearAllNotifications(req.userid, req.organizationId);
        res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
