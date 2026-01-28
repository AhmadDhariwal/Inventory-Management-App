const express = require("express");
const router = express.Router();
const businessSettingsController = require("../controllers/businesssettings.controller");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// Business settings management routes
router.get("/", verifytoken, businessSettingsController.getBusinessSettings);
router.put("/", verifytoken, restrictto(["admin"]), businessSettingsController.updateBusinessSettings);

// Specific settings routes
router.get("/company", verifytoken, businessSettingsController.getCompanyInfo);
router.get("/regional", verifytoken, businessSettingsController.getRegionalSettings);
router.get("/preferences", verifytoken, businessSettingsController.getBusinessPreferences);

module.exports = router;