const BusinessSettings = require('../models/businesssettings');

// Get business currency for pricing calculations
const getBusinessCurrency = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? settings.currency : 'USD';
  } catch (error) {
    console.error('Error getting business currency:', error);
    return 'USD';
  }
};

// Get business timezone for date calculations
const getBusinessTimezone = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? settings.timezone : 'UTC';
  } catch (error) {
    console.error('Error getting business timezone:', error);
    return 'UTC';
  }
};

// Get date format for display
const getDateFormat = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? settings.dateFormat : 'MM/DD/YYYY';
  } catch (error) {
    console.error('Error getting date format:', error);
    return 'MM/DD/YYYY';
  }
};

// Check if tax calculation is enabled
const isTaxCalculationEnabled = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? settings.enableTaxCalculation : true;
  } catch (error) {
    console.error('Error checking tax calculation setting:', error);
    return true;
  }
};

// Check if discounts are enabled
const areDiscountsEnabled = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? settings.enableDiscounts : true;
  } catch (error) {
    console.error('Error checking discounts setting:', error);
    return true;
  }
};

// Check if multi-location is enabled
const isMultiLocationEnabled = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? settings.enableMultiLocation : false;
  } catch (error) {
    console.error('Error checking multi-location setting:', error);
    return false;
  }
};

// Get company information
const getCompanyInfo = async () => {
  try {
    const settings = await BusinessSettings.findOne();
    return settings ? {
      companyName: settings.companyName,
      industry: settings.industry,
      address: settings.address,
      phone: settings.phone,
      email: settings.email
    } : null;
  } catch (error) {
    console.error('Error getting company info:', error);
    return null;
  }
};

module.exports = {
  getBusinessCurrency,
  getBusinessTimezone,
  getDateFormat,
  isTaxCalculationEnabled,
  areDiscountsEnabled,
  isMultiLocationEnabled,
  getCompanyInfo
};