const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  lowStockAlerts: {
    type: Boolean,
    default: true
  },
  orderUpdates: {
    type: Boolean,
    default: true
  },
  systemMaintenance: {
    type: Boolean,
    default: true
  },
  weeklyReports: {
    type: Boolean,
    default: false
  },
  monthlyReports: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);