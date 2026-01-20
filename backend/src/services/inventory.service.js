const express = require('express');
const Product = require("../models/product");
const Warehouse = require("../models/warehouse");
const stockmovement = require("../models/stockmovement");
//const user = require('../models/user');

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

module.exports = {
  getcurrentstock,
  addstock,
  removestock,
  getstocksummary,
};
