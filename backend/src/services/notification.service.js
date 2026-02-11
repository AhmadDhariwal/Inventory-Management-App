const Notification = require('../models/notification');
const NotificationSettings = require('../models/notificationsettings');
const User = require('../models/user');
const socketUtils = require('../utils/socket');
const mongoose = require('mongoose');

class NotificationService {
    /**
     * Create and send notification to a user if their settings allow it
     */
    async createNotification(userId, type, title, message, data = {}, organizationId) {
        try {
            // 1. Get or create settings atomically to avoid race conditions
            let settings = await NotificationSettings.findOneAndUpdate(
                { user: userId, organizationId },
                {
                    $setOnInsert: {
                        user: userId,
                        organizationId,
                        // Default settings are handled by schema defaults
                    }
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                }
            );

            // 2. Map notification type to setting field
            const settingMap = {
                'LOW_STOCK': 'lowStockAlerts',
                'PURCHASE_APPROVAL': 'purchaseApprovals',
                'STOCK_MOVEMENT': 'stockMovement',
                'ORDER_STATUS': 'orderUpdates',
                'SYSTEM': 'systemMaintenance'
            };

            const settingField = settingMap[type];

            // If the setting exists and is disabled, skip
            if (settingField !== undefined && settings[settingField] === false) {
                console.log(`Notification of type ${type} skipped for user ${userId} due to settings.`);
                return null;
            }

            // 3. Create notification in DB
            const notification = await Notification.create({
                user: userId,
                organizationId,
                type,
                title,
                message,
                data,
                read: false
            });

            // 4. Emit real-time event to user room
            socketUtils.getIO().to(`user_${userId}`).emit('notification', {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                createdAt: notification.createdAt,
                read: notification.read
            });

            return notification;
        } catch (error) {
            console.error('Error in createNotification:', error);
            throw error;
        }
    }

    /**
     * Send notification to multiple users (e.g., all admins in an org)
     */
    async notifyOrganizationRole(organizationId, role, type, title, message, data = {}) {
        try {
            const users = await User.find({ organizationId, role });
            const notifications = [];

            for (const user of users) {
                const notification = await this.createNotification(user._id, type, title, message, data, organizationId);
                if (notification) notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            console.error('Error in notifyOrganizationRole:', error);
            throw error;
        }
    }

    /**
     * Get paginated notifications for a user
     */
    async getNotifications(userId, organizationId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const filter = { user: userId, organizationId };
            const notifications = await Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Notification.countDocuments(filter);
            const unreadCount = await Notification.countDocuments({ ...filter, read: false });

            return {
                notifications,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                unreadCount
            };
        } catch (error) {
            console.error('Error in getNotifications:', error);
            throw error;
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId, userId, organizationId) {
        try {
            return await Notification.findOneAndDelete({ _id: notificationId, user: userId, organizationId });
        } catch (error) {
            console.error('Error in deleteNotification:', error);
            throw error;
        }
    }

    /**
     * Clear all notifications for a user
     */
    async clearAllNotifications(userId, organizationId) {
        try {
            return await Notification.deleteMany({ user: userId, organizationId });
        } catch (error) {
            console.error('Error in clearAllNotifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId, organizationId) {
        try {
            return await Notification.findOneAndUpdate(
                { _id: notificationId, user: userId, organizationId },
                { read: true },
                { new: true }
            );
        } catch (error) {
            console.error('Error in markAsRead:', error);
            throw error;
        }
    }

    /**
     * Mark all as read
     */
    async markAllAsRead(userId, organizationId) {
        try {
            return await Notification.updateMany({ user: userId, organizationId, read: false }, { read: true });
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
