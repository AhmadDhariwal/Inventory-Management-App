const BusinessSettings = require("../models/businesssettings");

class BusinessSettingsService {
  // Get business settings (create default if none exists)
  async getSettings() {
    try {
      let settings = await BusinessSettings.findOne();
      
      if (!settings) {
        settings = await BusinessSettings.create({
          companyName: "Your Company Name",
          industry: "other",
          currency: "USD",
          timezone: "UTC",
          dateFormat: "MM/DD/YYYY",
          language: "en",
          fiscalYearStart: "01",
          workingDays: "monday-friday",
          enableMultiLocation: false,
          enableTaxCalculation: true,
          enableDiscounts: true
        });
      }
      
      return settings;
    } catch (error) {
      throw new Error(`Failed to get business settings: ${error.message}`);
    }
  }

  // Update business settings
  async updateSettings(data) {
    try {
      const settings = await this.getSettings();
      Object.assign(settings, data);
      await settings.save();
      return settings;
    } catch (error) {
      throw new Error(`Failed to update business settings: ${error.message}`);
    }
  }

  // Get company information only
  async getCompanyInfo() {
    try {
      const settings = await this.getSettings();
      return {
        companyName: settings.companyName,
        industry: settings.industry,
        address: settings.address,
        phone: settings.phone,
        email: settings.email
      };
    } catch (error) {
      throw new Error(`Failed to get company info: ${error.message}`);
    }
  }

  // Get regional settings only
  async getRegionalSettings() {
    try {
      const settings = await this.getSettings();
      return {
        currency: settings.currency,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        language: settings.language
      };
    } catch (error) {
      throw new Error(`Failed to get regional settings: ${error.message}`);
    }
  }

  // Get business preferences only
  async getBusinessPreferences() {
    try {
      const settings = await this.getSettings();
      return {
        fiscalYearStart: settings.fiscalYearStart,
        workingDays: settings.workingDays,
        enableMultiLocation: settings.enableMultiLocation,
        enableTaxCalculation: settings.enableTaxCalculation,
        enableDiscounts: settings.enableDiscounts
      };
    } catch (error) {
      throw new Error(`Failed to get business preferences: ${error.message}`);
    }
  }
}

module.exports = new BusinessSettingsService();