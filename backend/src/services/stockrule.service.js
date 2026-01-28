const StockRule = require("../models/stockrule");

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
}

module.exports = new StockRuleService();