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

exports.getstocklevels = async (req, res) => {
  try {
    const productId = req.query.productId;
    const stockLevels = await inventoryservice.getstocklevels(productId);
    res.status(200).json(stockLevels);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatestocklevel = async (req, res) => {
  try {
    console.log('Update stock level request received');
    console.log('Stock Level ID:', req.params.id);
    console.log('Update Data:', req.body);
    console.log('User ID from token:', req.userid);
    
    const stockLevelId = req.params.id;
    const updateData = req.body;
    const updatedStockLevel = await inventoryservice.updatestocklevel(stockLevelId, updateData);
    
    console.log('Stock level update successful');
    res.status(200).json({
      message: "Stock level updated successfully",
      data: updatedStockLevel
    });
  } catch (error) {
    console.error('Error in updatestocklevel controller:', error);
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
