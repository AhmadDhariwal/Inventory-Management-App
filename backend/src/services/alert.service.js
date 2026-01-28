const stockRuleService = require("./stockrule.service");
const Inventory = require("../models/model");
const Product = require("../models/product");
const Warehouse = require("../models/warehouse");

class AlertService {
  // Check all products for low stock alerts
  async checkLowStockAlerts() {
    try {
      const rules = await stockRuleService.getRules();
      
      if (!rules.enableLowStockAlert) {
        return { alerts: [], message: "Low stock alerts are disabled" };
      }

      const alerts = [];
      
      // Get all inventory items
      const inventoryItems = await Inventory.find()
        .populate('product', 'name sku')
        .populate('warehouse', 'name');

      for (const item of inventoryItems) {
        const stockCheck = await stockRuleService.checkStockLevel(item.quantity);
        
        if (stockCheck.shouldAlert) {
          alerts.push({
            type: stockCheck.isCritical ? 'CRITICAL' : 'LOW_STOCK',
            product: item.product,
            warehouse: item.warehouse,
            currentStock: item.quantity,
            threshold: stockCheck.isCritical ? rules.criticalStockThreshold : rules.lowStockThreshold,
            message: `${item.product.name} is ${stockCheck.isCritical ? 'critically low' : 'low'} in ${item.warehouse.name}`,
            priority: stockCheck.isCritical ? 'HIGH' : 'MEDIUM',
            createdAt: new Date()
          });
        }
      }

      return {
        alerts,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.type === 'CRITICAL').length,
        lowStockAlerts: alerts.filter(a => a.type === 'LOW_STOCK').length
      };
    } catch (error) {
      throw new Error(`Failed to check low stock alerts: ${error.message}`);
    }
  }

  // Get dashboard warnings
  async getDashboardWarnings() {
    try {
      const alertData = await this.checkLowStockAlerts();
      
      const warnings = alertData.alerts.map(alert => ({
        id: `${alert.product._id}_${alert.warehouse._id}`,
        type: alert.type,
        title: alert.type === 'CRITICAL' ? 'Critical Stock Level' : 'Low Stock Alert',
        message: alert.message,
        priority: alert.priority,
        product: alert.product.name,
        warehouse: alert.warehouse.name,
        currentStock: alert.currentStock,
        threshold: alert.threshold,
        createdAt: alert.createdAt
      }));

      return {
        warnings,
        summary: {
          total: alertData.totalAlerts,
          critical: alertData.criticalAlerts,
          low: alertData.lowStockAlerts
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard warnings: ${error.message}`);
    }
  }

  // Generate notification triggers
  async generateNotificationTriggers() {
    try {
      const rules = await stockRuleService.getRules();
      const alertData = await this.checkLowStockAlerts();
      
      const notifications = [];
      
      for (const alert of alertData.alerts) {
        notifications.push({
          type: 'STOCK_ALERT',
          severity: alert.type === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          title: `Stock Alert: ${alert.product.name}`,
          message: alert.message,
          data: {
            productId: alert.product._id,
            warehouseId: alert.warehouse._id,
            currentStock: alert.currentStock,
            threshold: alert.threshold,
            stockLevel: alert.type
          },
          recipients: ['admin', 'inventory_manager'], // Configure based on rules
          channels: ['email', 'dashboard'], // Configure based on notification settings
          createdAt: new Date()
        });
      }

      return notifications;
    } catch (error) {
      throw new Error(`Failed to generate notification triggers: ${error.message}`);
    }
  }

  // Check specific product stock level
  async checkProductStockLevel(productId, warehouseId) {
    try {
      const inventory = await Inventory.findOne({
        product: productId,
        warehouse: warehouseId
      }).populate('product', 'name sku').populate('warehouse', 'name');

      if (!inventory) {
        return {
          status: 'NOT_FOUND',
          message: 'Product not found in warehouse'
        };
      }

      const stockCheck = await stockRuleService.checkStockLevel(inventory.quantity);
      
      return {
        status: stockCheck.isCritical ? 'CRITICAL' : stockCheck.isLow ? 'LOW' : 'OK',
        product: inventory.product,
        warehouse: inventory.warehouse,
        currentStock: inventory.quantity,
        stockCheck,
        message: this.getStockStatusMessage(stockCheck, inventory.product.name)
      };
    } catch (error) {
      throw new Error(`Failed to check product stock level: ${error.message}`);
    }
  }

  // Helper: Get stock status message
  getStockStatusMessage(stockCheck, productName) {
    if (stockCheck.isCritical) {
      return `${productName} stock is critically low and requires immediate attention`;
    } else if (stockCheck.isLow) {
      return `${productName} stock is below threshold and should be restocked soon`;
    } else {
      return `${productName} stock level is adequate`;
    }
  }
}

module.exports = new AlertService();