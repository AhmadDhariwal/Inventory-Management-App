const SecuritySettings = require('../models/securitysettings');
const NotificationSettings = require('../models/notificationsettings');
const InventorySettings = require('../models/inventorysettings');
const BusinessSettings = require('../models/businesssettings');
const mongoose = require('mongoose');

// Security Settings
const getSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.userid;
    let settings = await SecuritySettings.findOne({ user: new mongoose.Types.ObjectId(userId) });

    if (!settings) {
      settings = await SecuritySettings.create({ user: userId });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getSecuritySettings:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.userid;
    const settings = await SecuritySettings.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error in updateSecuritySettings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Notification Settings
const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.userid;
    let settings = await NotificationSettings.findOne({ user: new mongoose.Types.ObjectId(userId) });

    if (!settings) {
      settings = await NotificationSettings.create({ user: userId });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getNotificationSettings:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.userid;
    const settings = await NotificationSettings.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error in updateNotificationSettings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Inventory Settings
const getInventorySettings = async (req, res) => {
  try {
    const userId = req.user.userid;
    let settings = await InventorySettings.findOne({ user: new mongoose.Types.ObjectId(userId) });

    if (!settings) {
      settings = await InventorySettings.create({ user: userId });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getInventorySettings:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateInventorySettings = async (req, res) => {
  try {
    const userId = req.user.userid;
    const settings = await InventorySettings.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Inventory settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error in updateInventorySettings:', error);
    res.status(500).json({ error: error.message });
  }
};

const businessSettingsService = require('../services/businesssettings.service');

// Business Settings (Global/Company)
const getBusinessSettings = async (req, res) => {
  try {
    const { organizationId } = req;
    const settings = await businessSettingsService.getSettings(organizationId);

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getBusinessSettings:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateBusinessSettings = async (req, res) => {
  try {
    const { organizationId } = req;
    const settings = await businessSettingsService.updateSettings(organizationId, req.body);

    res.status(200).json({
      success: true,
      message: 'Business settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error in updateBusinessSettings:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSecuritySettings,
  updateSecuritySettings,
  getNotificationSettings,
  updateNotificationSettings,
  getInventorySettings,
  updateInventorySettings,
  getBusinessSettings,
  updateBusinessSettings
};