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

module.exports = {
  getcurrentstock,
  addstock,
  removestock,
};
