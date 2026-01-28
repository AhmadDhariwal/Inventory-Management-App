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