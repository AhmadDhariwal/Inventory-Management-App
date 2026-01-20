const express = require ("express");
const inventoryservice = require("../services/inventory.service");


exports.addstock = async (req, res) => {
  try {
    const movement = await inventoryservice.addstock({
      productId: req.body.productId,
      warehouseId: req.body.warehouseId,
      quantity: req.body.quantity,
      reason: req.body.reason,
      userId: req.userid,
    });

    res.status(201).json({
      message: "Stock added successfully",
      data: movement,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removestock = async (req, res) => {
  try {
    const movement = await inventoryservice.removestock({
      productId: req.body.productId,
      warehouseId: req.body.warehouseId,
      quantity: req.body.quantity,
      reason: req.body.reason,
      userId: req.userid,
    });

    res.status(201).json({
      message: "Stock removed successfully",
      data: movement,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getstock = async (req, res) => {
  try {
    const stock = await inventoryservice.getcurrentstock(
      req.params.productId,
      req.params.warehouseId
    );

    res.status(200).json({ stock });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getstocksummary = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      warehouseId: req.query.warehouseId,
      productId: req.query.productId
    };
    
    const summary = await inventoryservice.getstocksummary(filters);
    res.status(200).json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
