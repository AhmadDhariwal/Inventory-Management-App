const BusinessSettings = require("../models/businesssettings");
const { sendNotification } = require("../utils/socket");

class BusinessSettingsService {
  // Get business settings (create default if none exists)
  async getSettings(organizationId) {
    try {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      let settings = await BusinessSettings.findOne({ organizationId });

      if (!settings) {
        settings = await BusinessSettings.create({
          organizationId,
          companyName: "Your Company Name",
          industry: "other",
          currency: "USD",
          timezone: "UTC",
          dateFormat: "MM/DD/YYYY",
          language: "en",
          fiscalYearStart: "01",
          fiscalYearEnd: "12",
          workingDays: "monday-friday",
          defaultTaxRate: 0,
          autoSkuPrefix: 'SKU-',
          maintenanceMode: false,
          enableMultiLocation: false,
          enableTaxCalculation: true,
          enableDiscounts: true,
          defaultTheme: 'light'
        });
      }

      return settings;
    } catch (error) {
      throw new Error(`Failed to get business settings: ${error.message}`);
    }
  }

  // Update business settings
  async updateSettings(organizationId, data) {
    try {
      const settings = await this.getSettings(organizationId);

      // Update fields
      Object.assign(settings, data);
      await settings.save();

      // Emit real-time update
      sendNotification(organizationId.toString(), 'SETTINGS_UPDATED', settings);

      return settings;
    } catch (error) {
      throw new Error(`Failed to update business settings: ${error.message}`);
    }
  }

  // Get company information only
  async getCompanyInfo(organizationId) {
    try {
      const settings = await this.getSettings(organizationId);
      return {
        companyName: settings.companyName,
        industry: settings.industry,
        taxId: settings.taxId,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website
      };
    } catch (error) {
      throw new Error(`Failed to get company info: ${error.message}`);
    }
  }

  // Get regional settings only
  async getRegionalSettings(organizationId) {
    try {
      const settings = await this.getSettings(organizationId);
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
  async getBusinessPreferences(organizationId) {
    try {
      const settings = await this.getSettings(organizationId);
      return {
        fiscalYearStart: settings.fiscalYearStart,
        fiscalYearEnd: settings.fiscalYearEnd,
        workingDays: settings.workingDays,
        defaultTaxRate: settings.defaultTaxRate,
        autoSkuPrefix: settings.autoSkuPrefix,
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
