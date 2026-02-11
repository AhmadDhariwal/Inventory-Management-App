const InventorySettings = require('../models/inventorysettings');
const StockLevel = require('../models/stocklevel');
const NotificationSettings = require('../models/notificationsettings');
const StockMovement = require('../models/stockmovement');
const Product = require('../models/product');
const User = require('../models/user');
const stockLevelService = require('./stocklevel.service');
const { getOrganizationFilter } = require('../utils/rbac.helpers');
const mongoose = require('mongoose');

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

// Get low stock items based on user settings with role-based filtering
const getLowStockItems = async (userId, organizationId, user = null) => {
  try {
    const thresholds = await getUserStockThresholds(userId);
    const alertsEnabled = await checkLowStockAlertsEnabled(userId);

    if (!alertsEnabled) {
      return [];
    }

    // Build role-based filter
    let assignedUsers = [];
    if (user && user.role === 'manager') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc?.assignedUsers || [];
    }

    // Get accessible product IDs based on role
    let productFilter = { organizationId: new mongoose.Types.ObjectId(organizationId) };
    if (user && user.role !== 'admin') {
      const userIds = user.role === 'manager'
        ? [user.userid, ...assignedUsers]
        : [user.userid];
      productFilter.createdby = { $in: userIds };
    }

    const accessibleProducts = await Product.find(productFilter).select('_id').lean();
    const productIds = accessibleProducts.map(p => p._id);

    const query = {
      organizationId,
      product: { $in: productIds },
      $expr: { $lte: ["$quantity", thresholds.lowStockThreshold] }
    };

    const lowStockItems = await StockLevel.find(query)
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

// Get stock levels for a specific product or all products with role-based filtering
const getstocklevels = async (productId, organizationId, user = null) => {
  try {
    // Build role-based filter for products
    let assignedUsers = [];
    if (user && user.role === 'manager') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc?.assignedUsers || [];
    }

    // Get accessible product IDs based on role
    let productFilter = { organizationId: new mongoose.Types.ObjectId(organizationId) };
    if (productId) {
      productFilter._id = new mongoose.Types.ObjectId(productId);
    }
    if (user && user.role !== 'admin') {
      const userIds = user.role === 'manager'
        ? [user.userid, ...assignedUsers]
        : [user.userid];
      productFilter.createdby = { $in: userIds };
    }

    const accessibleProducts = await Product.find(productFilter).select('_id').lean();
    const productIds = accessibleProducts.map(p => p._id);

    let query = {
      organizationId,
      product: { $in: productIds }
    };

    let stockLevels = await StockLevel.find(query)
      .populate('product', 'name sku cost price')
      .populate('warehouse', 'name')
      .lean();

    if (stockLevels.length === 0 && productId) {
      await stockLevelService.initializeStockLevels(organizationId);
      stockLevels = await StockLevel.find(query)
        .populate('product', 'name sku cost price')
        .populate('warehouse', 'name')
        .lean();
    }

    return stockLevels.map(level => ({
      ...level,
      availableQty: level.quantity,
      totalValue: (level.quantity || 0) * (level.product?.cost || level.product?.price || 0)
    }));
  } catch (error) {
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
    user: data.userId,
    organizationId: data.organizationId // Use organizationId
  });

  await movement.save();

  // Update stock level quantity
  await stockLevelService.updateStockQuantity(data.productId, data.warehouseId, data.organizationId, data.quantity);

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
    user: data.userId,
    organizationId: data.organizationId // Use organizationId
  });

  await movement.save();

  // Update stock level quantity
  await stockLevelService.updateStockQuantity(data.productId, data.warehouseId, data.organizationId, -data.quantity);

  return movement;
};

// Get current stock for a product in a warehouse
const getcurrentstock = async (productId, warehouseId, organizationId) => {
  const query = {
    product: productId,
    warehouse: warehouseId
  };

  if (organizationId) {
    query.organizationId = organizationId;
  }

  const stockLevel = await StockLevel.findOne(query);

  return stockLevel ? stockLevel.quantity : 0;
};

// Update stock level
const updatestocklevel = async (stockLevelId, updateData, organizationId) => {
  const updatedStockLevel = await StockLevel.findOneAndUpdate(
    { _id: stockLevelId, organizationId },
    updateData,
    { new: true }
  ).populate('product', 'name sku').populate('warehouse', 'name');

  return updatedStockLevel;
};

// Get stock summary with role-based filtering
const getstocksummary = async (filters, user = null) => {
  // Build role-based filter for products
  let assignedUsers = [];
  if (user && user.role === 'manager') {
    const userDoc = await User.findById(user.userid);
    assignedUsers = userDoc?.assignedUsers || [];
  }

  // Get accessible product IDs based on role
  let productFilter = { organizationId: new mongoose.Types.ObjectId(filters.organizationId) };
  if (user && user.role !== 'admin') {
    const userIds = user.role === 'manager'
      ? [user.userid, ...assignedUsers]
      : [user.userid];
    productFilter.createdby = { $in: userIds };
  }

  const accessibleProducts = await Product.find(productFilter).select('_id').lean();
  const productIds = accessibleProducts.map(p => p._id);

  const query = {
    organizationId: filters.organizationId,
    product: { $in: productIds }
  };

  const stockLevels = await StockLevel.find(query)
    .populate('product', 'cost price')
    .lean();

  const totalProducts = stockLevels.length;
  const totalStock = stockLevels.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const inventoryValue = stockLevels.reduce((sum, item) => {
    const value = (item.quantity || 0) * (item.product?.cost || item.product?.price || 0);
    return sum + value;
  }, 0);

  const lowStockItems = stockLevels.filter(item =>
    item.minStock > 0 && item.quantity <= item.minStock
  ).length;

  return {
    totalProducts,
    totalStock,
    lowStockItems,
    inventoryValue
  };
};

// Update stock movement
const updatemovement = async (id, data, organizationId) => {
  const oldMovement = await StockMovement.findById(id);
  if (!oldMovement) throw new Error('Movement not found');

  // Reverse old effect
  const reverseDelta = oldMovement.type === 'IN' ? -oldMovement.quantity : oldMovement.quantity;
  await stockLevelService.updateStockQuantity(oldMovement.product, oldMovement.warehouse, organizationId, reverseDelta);

  // Update record
  const updatedMovement = await StockMovement.findByIdAndUpdate(id, data, { new: true });

  // Apply new effect
  const newDelta = updatedMovement.type === 'IN' ? updatedMovement.quantity : -updatedMovement.quantity;
  await stockLevelService.updateStockQuantity(updatedMovement.product, updatedMovement.warehouse, organizationId, newDelta);

  return updatedMovement;
};

// Delete stock movement
const deletemovement = async (id, organizationId) => {
  const movement = await StockMovement.findById(id);
  if (!movement) throw new Error('Movement not found');

  // Reverse effect before deleting
  const reverseDelta = movement.type === 'IN' ? -movement.quantity : movement.quantity;
  await stockLevelService.updateStockQuantity(movement.product, movement.warehouse, organizationId, reverseDelta);

  await StockMovement.findByIdAndDelete(id);
  return { message: 'Movement deleted successfully' };
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
  getstocksummary,
  updatemovement,
  deletemovement
};