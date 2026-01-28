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

  // POST /api/stockrules/product-rule
  async createOrUpdateProductStockRule(req, res) {
    try {
      // For now, just return success - this would typically update product-specific rules
      res.status(200).json({
        success: true,
        data: req.body,
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