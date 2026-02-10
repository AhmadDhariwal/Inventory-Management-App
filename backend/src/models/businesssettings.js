const mongoose = require("mongoose");

const businessSettingsSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  // Organization Information
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    enum: ['retail', 'manufacturing', 'wholesale', 'services', 'technology', 'healthcare', 'it', 'education', 'other'],
    default: 'other'
  },
  taxId: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },

  // Regional Settings
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'CAD', 'AUD', 'AED', 'SAR'],
    default: 'USD'
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC'
  },
  dateFormat: {
    type: String,
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'],
    default: 'MM/DD/YYYY'
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'ur', 'hi', 'ar'],
    default: 'en'
  },

  // Business Preferences
  fiscalYearStart: {
    type: String,
    enum: ['01', '04', '07', '10'],
    default: '01'
  },
  fiscalYearEnd: {
    type: String,
    enum: ['12', '03', '06', '09'],
    default: '12'
  },
  workingDays: {
    type: String,
    enum: ['monday-friday', 'monday-saturday', 'sunday-thursday', 'custom'],
    default: 'monday-friday'
  },
  defaultTaxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  autoSkuPrefix: {
    type: String,
    trim: true,
    default: 'SKU-'
  },

  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  enableMultiLocation: {
    type: Boolean,
    default: false
  },
  enableTaxCalculation: {
    type: Boolean,
    default: true
  },
  enableDiscounts: {
    type: Boolean,
    default: true
  },
  defaultTheme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light'
  },
  systemLogo: {
    type: String
  },
  emailSignature: {
    type: String
  },
  // Security Settings
  securitySettings: {
    twoFactorEnforced: {
      type: Boolean,
      default: false
    },
    passwordExpiryDays: {
      type: Number,
      default: 90
    },
    sessionTimeout: {
      type: Number,
      default: 60 // minutes
    }
  }
}, {
  timestamps: true,
  collection: 'businesssettings'
});

// Organization-specific settings are handled by organizationId: { unique: true }

module.exports = mongoose.model("BusinessSettings", businessSettingsSchema);