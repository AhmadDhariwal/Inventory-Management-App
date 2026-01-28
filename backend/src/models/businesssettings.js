const mongoose = require("mongoose");

const businessSettingsSchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    enum: ['retail', 'manufacturing', 'wholesale', 'services', 'technology', 'healthcare', 'other'],
    default: 'other'
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
  
  // Regional Settings
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'CAD', 'AUD'],
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
    enum: ['en', 'es', 'fr', 'de', 'ur', 'hi'],
    default: 'en'
  },
  
  // Business Preferences
  fiscalYearStart: {
    type: String,
    enum: ['01', '04', '07', '10'],
    default: '01'
  },
  workingDays: {
    type: String,
    enum: ['monday-friday', 'monday-saturday', 'sunday-thursday', 'custom'],
    default: 'monday-friday'
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
  }
}, { 
  timestamps: true,
  collection: 'businesssettings'
});

// Ensure only one business settings document exists
businessSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model("BusinessSettings", businessSettingsSchema);