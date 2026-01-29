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