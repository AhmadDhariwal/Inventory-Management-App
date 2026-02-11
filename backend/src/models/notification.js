const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['LOW_STOCK', 'PURCHASE_APPROVAL', 'STOCK_MOVEMENT', 'ORDER_STATUS', 'SYSTEM', 'INFO', 'SUCCESS', 'WARNING']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Add index for paginated queries
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
