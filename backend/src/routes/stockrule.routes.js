const express = require("express");
const router = express.Router();
const stockRuleController = require("../controllers/stockrule.controller");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// Stock rule management routes
router.get("/", verifytoken, stockRuleController.getStockRules);
router.put("/", verifytoken, restrictto(["admin"]), stockRuleController.updateStockRules);

// Product-specific stock rules
router.post("/product-rule", verifytoken, stockRuleController.createOrUpdateProductStockRule);

// Utility routes
router.get("/check-stock/:quantity", verifytoken, stockRuleController.checkStockLevel);
router.get("/default-warehouse", verifytoken, stockRuleController.getDefaultWarehouse);

module.exports = router;