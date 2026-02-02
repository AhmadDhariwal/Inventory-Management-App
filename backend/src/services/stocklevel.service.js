const StockLevel = require('../models/stocklevel');
const Product = require('../models/product');
const Warehouse = require('../models/warehouse');

// Initialize stock levels for all products in all warehouses
const initializeStockLevels = async () => {
  try {
    const products = await Product.find();
    const warehouses = await Warehouse.find({ isActive: true });
    
    if (products.length === 0 || warehouses.length === 0) {
      console.log('No products or warehouses found to initialize stock levels');
      return { message: 'No products or warehouses found' };
    }
    
    let created = 0;
    let existing = 0;
    
    for (const product of products) {
      for (const warehouse of warehouses) {
        const existingStock = await StockLevel.findOne({
          product: product._id,
          warehouse: warehouse._id
        });
        
        if (!existingStock) {
          await StockLevel.create({
            product: product._id,
            warehouse: warehouse._id,
            quantity: Math.floor(Math.random() * 100) + 10, // Random quantity between 10-110
            reservedQuantity: 0,
            reorderLevel: 20,
            minStock: 10
          });
          created++;
        } else {
          existing++;
        }
      }
    }
    
    return {
      message: `Stock levels initialized: ${created} created, ${existing} already existed`,
      created,
      existing
    };
  } catch (error) {
    console.error('Error initializing stock levels:', error);
    throw error;
  }
};

// Get or create stock level for a specific product-warehouse combination
const getOrCreateStockLevel = async (productId, warehouseId) => {
  try {
    let stockLevel = await StockLevel.findOne({
      product: productId,
      warehouse: warehouseId
    }).populate('product', 'name sku').populate('warehouse', 'name');
    
    if (!stockLevel) {
      stockLevel = await StockLevel.create({
        product: productId,
        warehouse: warehouseId,
        quantity: 0,
        reservedQuantity: 0,
        reorderLevel: 20,
        minStock: 10
      });
      
      // Populate the created stock level
      stockLevel = await StockLevel.findById(stockLevel._id)
        .populate('product', 'name sku')
        .populate('warehouse', 'name');
    }
    
    return stockLevel;
  } catch (error) {
    console.error('Error getting or creating stock level:', error);
    throw error;
  }
};

module.exports = {
  initializeStockLevels,
  getOrCreateStockLevel
};