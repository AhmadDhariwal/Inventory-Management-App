const Inventory = require("../models/model");
const Product = require("../models/product");
const Warehouse = require("../models/warehouse");
const StockLevel = require("../models/stocklevel");

class AlertService {
  // Check all products for low stock alerts
  async checkLowStockAlerts() {
    try {
      const alerts = [];
      
      // Get all stock levels with reorder and min stock info
      const stockLevels = await StockLevel.find()
        .populate('product', 'name sku')
        .populate('warehouse', 'name');

      for (const stockLevel of stockLevels) {
        if (!stockLevel.product || !stockLevel.warehouse) continue;
        
        const currentStock = stockLevel.quantity || 0;
        const minStock = stockLevel.minStock || 0;
        const reorderLevel = stockLevel.reorderLevel || 0;
        
        let alertType = null;
        let priority = 'LOW';
        
        if (currentStock <= minStock) {
          alertType = 'CRITICAL';
          priority = 'HIGH';
        } else if (currentStock <= reorderLevel) {
          alertType = 'LOW_STOCK';
          priority = 'MEDIUM';
        }
        
        if (alertType) {
          alerts.push({
            type: alertType,
            product: stockLevel.product,
            warehouse: stockLevel.warehouse,
            currentStock,
            threshold: alertType === 'CRITICAL' ? minStock : reorderLevel,
            message: `${stockLevel.product.name} is ${alertType === 'CRITICAL' ? 'critically low' : 'low'} in ${stockLevel.warehouse.name}`,
            priority,
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
          recipients: ['admin', 'inventory_manager'],
          channels: ['email', 'dashboard'],
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
      const stockLevel = await StockLevel.findOne({
        product: productId,
        warehouse: warehouseId
      }).populate('product', 'name sku').populate('warehouse', 'name');

      if (!stockLevel) {
        return {
          status: 'NOT_FOUND',
          message: 'Product not found in warehouse'
        };
      }

      const currentStock = stockLevel.quantity || 0;
      const minStock = stockLevel.minStock || 0;
      const reorderLevel = stockLevel.reorderLevel || 0;
      
      let status = 'OK';
      if (currentStock <= minStock) {
        status = 'CRITICAL';
      } else if (currentStock <= reorderLevel) {
        status = 'LOW';
      }
      
      return {
        status,
        product: stockLevel.product,
        warehouse: stockLevel.warehouse,
        currentStock,
        minStock,
        reorderLevel,
        message: this.getStockStatusMessage(status, stockLevel.product.name)
      };
    } catch (error) {
      throw new Error(`Failed to check product stock level: ${error.message}`);
    }
  }

  // Helper: Get stock status message
  getStockStatusMessage(status, productName) {
    if (status === 'CRITICAL') {
      return `${productName} stock is critically low and requires immediate attention`;
    } else if (status === 'LOW') {
      return `${productName} stock is below threshold and should be restocked soon`;
    } else {
      return `${productName} stock level is adequate`;
    }
  }
}

module.exports = new AlertService();