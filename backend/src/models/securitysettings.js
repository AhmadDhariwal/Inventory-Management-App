const mongoose = require('mongoose');

const securitySettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  sessionTimeout: {
    type: Number,
    default: 30,
    min: 5
  },
  passwordExpiry: {
    type: Number,
    default: 90,
    min: 30
  },
  maxLoginAttempts: {
    type: Number,
    default: 5,
    min: 3
  },
  requireStrongPassword: {
    type: Boolean,
    default: true
  },
  enableTwoFactor: {
    type: Boolean,
    default: false
  },
  enableAuditLog: {
    type: Boolean,
    default: true
  },
  allowedIPs: [{
    type: String
  }],
  restrictByLocation: {
    type: Boolean,
    default: false
  },
  enableSSO: {
    type: Boolean,
    default: false
  },
  requireApproval: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

securitySettingsSchema.index({ user: 1, organizationId: 1 }, { unique: true });

module.exports = mongoose.model('SecuritySettings', securitySettingsSchema);