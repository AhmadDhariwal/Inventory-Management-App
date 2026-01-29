const express = require('express');
const mongoose = require('mongoose');
const Product = require("../models/product");
const Warehouse = require("../models/warehouse");
const stockmovement = require("../models/stockmovement");
const StockLevel = require("../models/stocklevel");

const getcurrentstock = async (productId, warehouseId) => {
  const movements = await stockmovement.find({
    product: productId,
    warehouse: warehouseId,
  });

  let stock = 0;

  movements.forEach((move) => {
    if (move.type === "IN"){
         stock += move.quantity;
    }
    if (move.type === "OUT") {
        stock -= move.quantity;
    }
  });

  return stock;
};


const updateStockLevel = async (productId, warehouseId) => {
  // Validate ObjectIds to prevent injection
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }
  if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
    throw new Error('Invalid warehouse ID');
  }
  
  const currentStock = await getcurrentstock(productId, warehouseId);
  
  await StockLevel.findOneAndUpdate(
    { product: new mongoose.Types.ObjectId(productId), warehouse: new mongoose.Types.ObjectId(warehouseId) },
    { quantity: currentStock },
    { upsert: true, new: true }
  );
};

const addstock = async ({ productId, warehouseId, quantity, reason, userId }) => {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) throw new Error("Warehouse not found");

  const movement = await stockmovement.create({
    product: productId,
    warehouse: warehouseId,
    type: "IN",
    quantity,
    reason,
    user: userId,
  });

  // Update StockLevel collection
  await updateStockLevel(productId, warehouseId);

  return movement;
};

const removestock = async ({ productId, warehouseId, quantity, reason, userId }) => {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const currentstock = await getcurrentstock(productId, warehouseId);

  if (quantity > currentstock) {
    throw new Error("Insufficient stock");
  }

  const movement = await stockmovement.create({
    product: productId,
    warehouse: warehouseId,
    type: "OUT",
    quantity,
    reason,
    user: userId,
  });

  // Update StockLevel collection
  await updateStockLevel(productId, warehouseId);

  return movement;
};

const getstocksummary = async (filters = {}) => {
  const { startDate, endDate, warehouseId, productId } = filters;
  
  // Build match conditions
  let matchConditions = {};
  
  if (startDate || endDate) {
    matchConditions.createdAt = {};
    if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
    if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
  }
  
  if (warehouseId) matchConditions.warehouse = warehouseId;
  if (productId) matchConditions.product = productId;

  // Get total products
  const totalProducts = await Product.countDocuments(
    productId ? { _id: productId } : {}
  );

  // Get total stock from movements
  const stockAggregation = await stockmovement.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: "$product",
        totalIn: {
          $sum: {
            $cond: [{ $eq: ["$type", "IN"] }, "$quantity", 0]
          }
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ["$type", "OUT"] }, "$quantity", 0]
          }
        }
      }
    },
    {
      $project: {
        netStock: { $subtract: ["$totalIn", "$totalOut"] }
      }
    },
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$netStock" }
      }
    }
  ]);

  const totalStock = stockAggregation[0]?.totalStock || 0;

  // Get low stock items - since Product model doesn't have stockquantity/minstocklevel fields
  // We'll calculate based on actual stock movements vs a threshold
  const lowStockThreshold = 10; // Define minimum stock threshold
  const lowStockAggregation = await stockmovement.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: "$product",
        totalIn: {
          $sum: {
            $cond: [{ $eq: ["$type", "IN"] }, "$quantity", 0]
          }
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ["$type", "OUT"] }, "$quantity", 0]
          }
        }
      }
    },
    {
      $project: {
        netStock: { $subtract: ["$totalIn", "$totalOut"] }
      }
    },
    {
      $match: {
        netStock: { $lte: lowStockThreshold }
      }
    },
    {
      $count: "lowStockCount"
    }
  ]);

  const lowStockItems = lowStockAggregation[0]?.lowStockCount || 0;

  // Get warehouses count
  const warehouses = await Warehouse.countDocuments(
    warehouseId ? { _id: warehouseId } : {}
  );

  // Calculate inventory value using stock movements and product prices
  const inventoryValueAggregation = await stockmovement.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: "$product",
        totalIn: {
          $sum: {
            $cond: [{ $eq: ["$type", "IN"] }, "$quantity", 0]
          }
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ["$type", "OUT"] }, "$quantity", 0]
          }
        }
      }
    },
    {
      $project: {
        netStock: { $subtract: ["$totalIn", "$totalOut"] }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: "$product"
    },
    {
      $project: {
        value: { $multiply: ["$netStock", "$product.price"] }
      }
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$value" }
      }
    }
  ]);

  return {
    totalProducts,
    totalStock,
    lowStockItems,
    warehouses,
    inventoryValue: inventoryValueAggregation[0]?.totalValue || 0
  };
};

const getstocklevels = async (productId) => {
  // If specific product requested, get its stock levels
  if (productId) {
    // Calculate stock from movements
    const stockAggregation = await stockmovement.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$warehouse",
          quantity: {
            $sum: {
              $cond: [
                { $eq: ["$type", "IN"] },
                "$quantity",
                { $multiply: ["$quantity", -1] }
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "_id",
          foreignField: "_id",
          as: "warehouse"
        }
      },
      {
        $unwind: "$warehouse"
      }
    ]);

    // Get product info
    const product = await Product.findById(productId)
      .populate('category', 'name')
      .lean();

    if (!product) {
      return [];
    }

    // Get stock levels from StockLevel collection
    const stockLevels = await StockLevel.find({ product: productId })
      .populate('warehouse', 'name')
      .lean();

    // Build result with actual stock levels
    const result = [];
    
    if (stockAggregation.length > 0) {
      for (const stock of stockAggregation) {
        // Find or create stock level record
        let stockLevel = await StockLevel.findOne({
          product: productId,
          warehouse: stock._id
        });
        
        if (!stockLevel) {
          stockLevel = await StockLevel.create({
            product: productId,
            warehouse: stock._id,
            quantity: Math.max(0, stock.quantity),
            reservedQuantity: 0,
            reorderLevel: 0,
            minStock: 0
          });
        } else {
          // Update quantity to match actual stock movements
          stockLevel.quantity = Math.max(0, stock.quantity);
          await stockLevel.save();
        }
        
        result.push({
          _id: stockLevel._id,
          product: {
            _id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category
          },
          warehouse: stock.warehouse,
          quantity: Math.max(0, stock.quantity),
          reorderLevel: stockLevel.reorderLevel || 0,
          minStock: stockLevel.minStock || 0,
          reservedQuantity: stockLevel.reservedQuantity || 0
        });
      }
    } else {
      // No stock movements, check if there are any warehouses
      const warehouses = await Warehouse.find({ isActive: true }).lean();
      if (warehouses.length > 0) {
        // Create stock level for first warehouse if none exists
        let stockLevel = await StockLevel.findOne({
          product: productId,
          warehouse: warehouses[0]._id
        });
        
        if (!stockLevel) {
          stockLevel = await StockLevel.create({
            product: productId,
            warehouse: warehouses[0]._id,
            quantity: 0,
            reservedQuantity: 0,
            reorderLevel: 0,
            minStock: 0
          });
        }
        
        result.push({
          _id: stockLevel._id,
          product: {
            _id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category
          },
          warehouse: warehouses[0],
          quantity: 0,
          reorderLevel: stockLevel.reorderLevel || 0,
          minStock: stockLevel.minStock || 0,
          reservedQuantity: stockLevel.reservedQuantity || 0
        });
      }
    }

    return result;
  }

  // Get all stock levels if no specific product
  const stockLevels = await StockLevel.find({})
    .populate({
      path: 'product',
      select: 'name sku category',
      populate: {
        path: 'category',
        select: 'name'
      }
    })
    .populate('warehouse', 'name')
    .lean();
  
  // Return enriched levels with reorder and min stock from the stock level itself
  const enrichedLevels = stockLevels.map(level => {
    // Check if product and warehouse exist
    if (!level.product || !level.warehouse) {
      return {
        ...level,
        reorderLevel: 0,
        minStock: 0,
        reservedQuantity: 0
      };
    }
    
    return {
      _id: level._id, // Include the stock level ID for updates
      ...level,
      reorderLevel: level.reorderLevel || 0,
      minStock: level.minStock || 0,
      reservedQuantity: level.reservedQuantity || 0
    };
  });
  
  return enrichedLevels;
};

const updatestocklevel = async (stockLevelId, updateData) => {
  console.log('Updating stock level ID:', stockLevelId);
  console.log('Update data:', updateData);
  
  const stockLevel = await StockLevel.findByIdAndUpdate(
    stockLevelId,
    updateData,
    { new: true }
  ).populate('product', 'name sku')
   .populate('warehouse', 'name');
   
  if (!stockLevel) {
    throw new Error('Stock level not found');
  }
  
  console.log('Updated stock level:', stockLevel);
  return stockLevel;
};

module.exports = {
  getcurrentstock,
  addstock,
  removestock,
  getstocksummary,
  getstocklevels,
  updatestocklevel,
};
