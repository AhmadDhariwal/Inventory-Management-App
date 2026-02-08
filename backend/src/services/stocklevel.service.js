const StockLevel = require('../models/stocklevel');
const Product = require('../models/product');
const Warehouse = require('../models/warehouse');

// Initialize stock levels for all products in all warehouses
// Initialize stock levels for all products in all warehouses for a specific organization
const initializeStockLevels = async (organizationId) => {
  try {
    const query = organizationId ? { organizationId } : {};

    // Only fetch products/warehouses for this organization (or global if no orgId provided/legacy)
    const products = await Product.find(query);
    const warehouses = await Warehouse.find({ ...query, isActive: true });

    if (products.length === 0 || warehouses.length === 0) {
      console.log('No products or warehouses found to initialize stock levels');
      return { message: 'No products or warehouses found' };
    }

    let created = 0;
    let existing = 0;

    for (const product of products) {
      for (const warehouse of warehouses) {
        // Find existing stock level for this product-warehouse combo
        // Note: We don't strictly need organizationId here as product+warehouse should be unique
        // but adding it makes it safer.
        const stockQuery = {
          product: product._id,
          warehouse: warehouse._id
        };

        if (organizationId) {
          stockQuery.organizationId = organizationId;
        }

        const existingStock = await StockLevel.findOne(stockQuery);

        if (!existingStock) {
          const newStock = {
            product: product._id,
            warehouse: warehouse._id,
            quantity: Math.floor(Math.random() * 100) + 10, // Random quantity between 10-110
            reservedQuantity: 0,
            reorderLevel: 20,
            minStock: 10
          };

          if (organizationId) {
            newStock.organizationId = organizationId;
          }

          await StockLevel.create(newStock);
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
const getOrCreateStockLevel = async (productId, warehouseId, organizationId) => {
  try {
    let query = {
      product: productId,
      warehouse: warehouseId
    };

    if (organizationId) {
      query.organizationId = organizationId;
    }

    let stockLevel = await StockLevel.findOne(query)
      .populate('product', 'name sku')
      .populate('warehouse', 'name');

    if (!stockLevel) {
      const newStock = {
        product: productId,
        warehouse: warehouseId,
        quantity: 0,
        reservedQuantity: 0,
        reorderLevel: 20,
        minStock: 10
      };

      if (organizationId) {
        newStock.organizationId = organizationId;
      }

      stockLevel = await StockLevel.create(newStock);

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

// Update stock quantity for a specific product-warehouse combination
const updateStockQuantity = async (productId, warehouseId, organizationId, quantityDelta) => {
  try {
    const stockLevel = await getOrCreateStockLevel(productId, warehouseId, organizationId);
    stockLevel.quantity += quantityDelta;

    // Ensure stock doesn't go below 0 if not allowed (optional, but good practice)
    if (stockLevel.quantity < 0) stockLevel.quantity = 0;

    await stockLevel.save();
    return stockLevel;
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    throw error;
  }
};

module.exports = {
  initializeStockLevels,
  getOrCreateStockLevel,
  updateStockQuantity
};