const InventorySettings = require('../models/inventorysettings');
const StockLevel = require('../models/stocklevel');
const NotificationSettings = require('../models/notificationsettings');
const StockMovement = require('../models/stockmovement');
const stockLevelService = require('./stocklevel.service');

// Check if user allows negative stock
const checkNegativeStockAllowed = async (userId) => {
  try {
    const settings = await InventorySettings.findOne({ user: userId });
    return settings ? settings.allowNegativeStock : false;
  } catch (error) {
    console.error('Error checking negative stock setting:', error);
    return false;
  }
};

// Get user's stock thresholds
const getUserStockThresholds = async (userId) => {
  try {
    const settings = await InventorySettings.findOne({ user: userId });
    return {
      lowStockThreshold: settings ? settings.lowStockThreshold : 10,
      criticalStockThreshold: settings ? settings.criticalStockThreshold : 5
    };
  } catch (error) {
    console.error('Error getting stock thresholds:', error);
    return { lowStockThreshold: 10, criticalStockThreshold: 5 };
  }
};

// Check if low stock alerts are enabled
const checkLowStockAlertsEnabled = async (userId) => {
  try {
    const inventorySettings = await InventorySettings.findOne({ user: userId });
    const notificationSettings = await NotificationSettings.findOne({ user: userId });
    
    const inventoryAlertsEnabled = inventorySettings ? inventorySettings.enableLowStockAlert : true;
    const notificationAlertsEnabled = notificationSettings ? notificationSettings.lowStockAlerts : true;
    
    return inventoryAlertsEnabled && notificationAlertsEnabled;
  } catch (error) {
    console.error('Error checking low stock alerts setting:', error);
    return true;
  }
};

// Get low stock items based on user settings
const getLowStockItems = async (userId) => {
  try {
    const thresholds = await getUserStockThresholds(userId);
    const alertsEnabled = await checkLowStockAlertsEnabled(userId);
    
    if (!alertsEnabled) {
      return [];
    }
    
    const lowStockItems = await StockLevel.find({
      $expr: { $lte: ["$quantity", thresholds.lowStockThreshold] }
    })
    .populate('product', 'name sku')
    .populate('warehouse', 'name')
    .lean();
    
    return lowStockItems.map(item => ({
      ...item,
      status: item.quantity <= thresholds.criticalStockThreshold ? 'CRITICAL' : 'LOW'
    }));
  } catch (error) {
    console.error('Error getting low stock items:', error);
    return [];
  }
};

// Get stock levels for a specific product or all products
const getstocklevels = async (productId) => {
  try {
    let query = {};
    if (productId) {
      query.product = productId;
    }
    
    let stockLevels = await StockLevel.find(query)
      .populate('product', 'name sku cost price')
      .populate('warehouse', 'name')
      .lean();
    
    // If no stock levels found and productId is provided, initialize them
    if (stockLevels.length === 0 && productId) {
      await stockLevelService.initializeStockLevels();
      stockLevels = await StockLevel.find(query)
        .populate('product', 'name sku cost price')
        .populate('warehouse', 'name')
        .lean();
    }
    
    return stockLevels;
  } catch (error) {
    console.error('Error getting stock levels:', error);
    throw error;
  }
};

// Add stock movement
const addstock = async (data) => {
  const movement = new StockMovement({
    product: data.productId,
    warehouse: data.warehouseId,
    type: 'IN',
    quantity: data.quantity,
    reason: data.reason,
    user: data.userId
  });
  
  await movement.save();
  
  // Update or create stock level
  await stockLevelService.getOrCreateStockLevel(data.productId, data.warehouseId);
  
  return movement;
};

// Remove stock movement
const removestock = async (data) => {
  const movement = new StockMovement({
    product: data.productId,
    warehouse: data.warehouseId,
    type: 'OUT',
    quantity: data.quantity,
    reason: data.reason,
    user: data.userId
  });
  
  await movement.save();
  
  // Update or create stock level
  await stockLevelService.getOrCreateStockLevel(data.productId, data.warehouseId);
  
  return movement;
};

// Get current stock for a product in a warehouse
const getcurrentstock = async (productId, warehouseId) => {
  const stockLevel = await StockLevel.findOne({
    product: productId,
    warehouse: warehouseId
  });
  
  return stockLevel ? stockLevel.quantity : 0;
};

// Update stock level
const updatestocklevel = async (stockLevelId, updateData) => {
  const updatedStockLevel = await StockLevel.findByIdAndUpdate(
    stockLevelId,
    updateData,
    { new: true }
  ).populate('product', 'name sku').populate('warehouse', 'name');
  
  return updatedStockLevel;
};

// Get stock summary
const getstocksummary = async (filters) => {
  // Implementation for stock summary
  return {
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    warehouses: 0,
    inventoryValue: 0
  };
};

module.exports = {
  checkNegativeStockAllowed,
  getUserStockThresholds,
  checkLowStockAlertsEnabled,
  getLowStockItems,
  getstocklevels,
  addstock,
  removestock,
  getcurrentstock,
  updatestocklevel,
  getstocksummary
};