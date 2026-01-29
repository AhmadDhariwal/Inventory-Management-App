import stockrule from "../backend/src/models/stockrule";

stockrule.service
const StockRule = require("../models/stockrule");
const Inventory = require("../models/model");

class StockRuleService {
  // Get stock rules (create default if none exists)
  async getRules() {
    try {
      let rules = await StockRule.findOne().populate('defaultWarehouse');
      
      if (!rules) {
        rules = await StockRule.create({
          allowNegativeStock: false,
          lowStockThreshold: 10,
          criticalStockThreshold: 5,
          enableLowStockAlert: true,
          autoUpdateStock: true,
          requireApprovalForRemoval: false,
          autoReceivePurchase: false,
          autoDeductSales: true,
          enableBarcodeScanning: true,
          trackSerialNumbers: false,
          trackBatchNumbers: false
        });
      }
      
      return rules;
    } catch (error) {
      throw new Error(`Failed to get stock rules: ${error.message}`);
    }
  }

  // Update stock rules with validation
  async updateRules(data) {
    try {
      // Validation
      if (data.lowStockThreshold < 0) {
        throw new Error("Low stock threshold cannot be negative");
      }
      
      if (data.criticalStockThreshold < 0) {
        throw new Error("Critical stock threshold cannot be negative");
      }
      
      if (data.criticalStockThreshold > data.lowStockThreshold) {
        throw new Error("Critical threshold cannot be higher than low stock threshold");
      }

      const rules = await this.getRules();
      Object.assign(rules, data);
      await rules.save();
      
      return await rules.populate('defaultWarehouse');
    } catch (error) {
      throw new Error(`Failed to update stock rules: ${error.message}`);
    }
  }

  // CRITICAL: Validate stock transaction against rules
  async validateStockTransaction(productId, warehouseId, quantity, operation = 'deduct') {
    try {
      const rules = await this.getRules();
      const inventory = await Inventory.findOne({ 
        product: productId, 
        warehouse: warehouseId 
      });

      const currentStock = inventory ? inventory.quantity : 0;
      const newStock = operation === 'deduct' ? currentStock - quantity : currentStock + quantity;

      // Check negative stock rule
      if (!rules.allowNegativeStock && newStock < 0) {
        throw new Error(`Insufficient stock. Available: ${currentStock}, Required: ${quantity}`);
      }

      // Check stock levels for alerts
      const stockCheck = await this.checkStockLevel(newStock);
      
      return {
        allowed: true,
        currentStock,
        newStock,
        stockCheck,
        warnings: this.generateWarnings(stockCheck, rules)
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate warnings based on stock levels
  generateWarnings(stockCheck, rules) {
    const warnings = [];
    
    if (stockCheck.isCritical && rules.enableLowStockAlert) {
      warnings.push('CRITICAL: Stock level is critically low!');
    } else if (stockCheck.isLow && rules.enableLowStockAlert) {
      warnings.push('WARNING: Stock level is below threshold');
    }
    
    return warnings;
  }

  // Check if negative stock is allowed
  async isNegativeStockAllowed() {
    const rules = await this.getRules();
    return rules.allowNegativeStock;
  }

  // Check if stock is below threshold
  async checkStockLevel(currentStock) {
    const rules = await this.getRules();
    
    return {
      isLow: currentStock <= rules.lowStockThreshold,
      isCritical: currentStock <= rules.criticalStockThreshold,
      shouldAlert: rules.enableLowStockAlert && currentStock <= rules.lowStockThreshold
    };
  }

  // Get default warehouse
  async getDefaultWarehouse() {
    const rules = await this.getRules();
    return rules.defaultWarehouse;
  }

  // Apply auto-deduction rule
  async shouldAutoDeductSales() {
    const rules = await this.getRules();
    return rules.autoDeductSales;
  }

  // Apply auto-receive rule
  async shouldAutoReceivePurchase() {
    const rules = await this.getRules();
    return rules.autoReceivePurchase;
  }

  // Check if approval is required
  async requiresApproval() {
    const rules = await this.getRules();
    return rules.requireApprovalForRemoval;
  }
}

module.exports = new StockRuleService();


stockrule.route----------------------------

const express = require("express");
const router = express.Router();
const stockRuleController = require("../controllers/stockrule.controller");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// Stock rule management routes
router.get("/", verifytoken, stockRuleController.getStockRules);
router.put("/", verifytoken, restrictto(["admin"]), stockRuleController.updateStockRules);

// Product-specific stock rules
router.post("/product-rule", verifytoken, stockRuleController.createOrUpdateProductStockRule);
router.get("/product-rule/:productId/:warehouseId", verifytoken, stockRuleController.getProductStockRule);

// Utility routes
router.get("/check-stock/:quantity", verifytoken, stockRuleController.checkStockLevel);
router.get("/default-warehouse", verifytoken, stockRuleController.getDefaultWarehouse);

module.exports = router;


stockrule.model.js----------------


const mongoose = require("mongoose");

const stockRuleSchema = new mongoose.Schema({
  allowNegativeStock: {
    type: Boolean,
    default: false,
    description: "Allow stock to go below zero"
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0,
    description: "Minimum stock level before alert"
  },
  criticalStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
    description: "Critical stock level for urgent alerts"
  },
  enableLowStockAlert: {
    type: Boolean,
    default: true,
    description: "Enable low stock notifications"
  },
  autoUpdateStock: {
    type: Boolean,
    default: true,
    description: "Auto update stock on purchase/sales"
  },
  defaultWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    description: "Default warehouse for operations"
  },
  requireApprovalForRemoval: {
    type: Boolean,
    default: false,
    description: "Require approval for stock removal"
  },
  autoReceivePurchase: {
    type: Boolean,
    default: false,
    description: "Auto receive purchase orders"
  },
  autoDeductSales: {
    type: Boolean,
    default: true,
    description: "Auto deduct stock on sales"
  },
  enableBarcodeScanning: {
    type: Boolean,
    default: true,
    description: "Enable barcode scanning features"
  },
  trackSerialNumbers: {
    type: Boolean,
    default: false,
    description: "Track individual serial numbers"
  },
  trackBatchNumbers: {
    type: Boolean,
    default: false,
    description: "Track batch/lot numbers"
  }
}, { 
  timestamps: true,
  collection: 'stockrules'
});

// Ensure only one stock rule document exists
stockRuleSchema.index({}, { unique: true });

module.exports = mongoose.model("StockRule", stockRuleSchema);


stockrule.controller.js--------------


const stockRuleService = require("../services/stockrule.service");

class StockRuleController {
  // GET /api/stockrules
  async getStockRules(req, res) {
    try {
      const rules = await stockRuleService.getRules();
      res.status(200).json({
        success: true,
        data: rules,
        message: "Stock rules retrieved successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/stockrules
  async updateStockRules(req, res) {
    try {
      const rules = await stockRuleService.updateRules(req.body);
      res.status(200).json({
        success: true,
        data: rules,
        message: "Stock rules updated successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/stockrules/product-rule/:productId/:warehouseId
  async getProductStockRule(req, res) {
    try {
      const { productId, warehouseId } = req.params;
      
      if (!productId || !warehouseId) {
        return res.status(400).json({
          success: false,
          message: "Product ID and warehouse ID are required"
        });
      }

      const ProductStockRule = require("../models/stock-rule");
      
      const stockRule = await ProductStockRule.findOne({
        product: productId,
        warehouse: warehouseId
      }).populate('product', 'name sku')
       .populate('warehouse', 'name');
      
      if (!stockRule) {
        return res.status(404).json({
          success: false,
          message: "Stock rule not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: stockRule,
        message: "Product stock rule retrieved successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/stockrules/product-rule
  async createOrUpdateProductStockRule(req, res) {
    try {
      const { product, warehouse, reorderLevel, minStock } = req.body;
      
      if (!product || !warehouse) {
        return res.status(400).json({
          success: false,
          message: "Product and warehouse are required"
        });
      }

      const ProductStockRule = require("../models/stock-rule");
      
      const stockRule = await ProductStockRule.findOneAndUpdate(
        { product, warehouse },
        { 
          product, 
          warehouse, 
          reorderLevel: Number(reorderLevel) || 0, 
          minStock: Number(minStock) || 0 
        },
        { upsert: true, new: true }
      ).populate('product', 'name sku')
       .populate('warehouse', 'name');
      
      res.status(200).json({
        success: true,
        data: stockRule,
        message: "Product stock rule updated successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/stockrules/check-stock/:quantity
  async checkStockLevel(req, res) {
    try {
      const quantity = parseInt(req.params.quantity);
      const stockCheck = await stockRuleService.checkStockLevel(quantity);
      
      res.status(200).json({
        success: true,
        data: stockCheck,
        message: "Stock level checked successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/stockrules/default-warehouse
  async getDefaultWarehouse(req, res) {
    try {
      const warehouse = await stockRuleService.getDefaultWarehouse();
      res.status(200).json({
        success: true,
        data: warehouse,
        message: "Default warehouse retrieved successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new StockRuleController();
