const express = require("express");
const purchaseorderservice = require("../services/purchaseorder.service");

const createpurchaseorder = async (req, res) => {
  try {
    const purchaseorder = await purchaseorderservice.createpurchaseorder(
      req.body,
      req.user.userid,
      req.organizationId // Pass organizationId
    );

    res.status(201).json({
      message: "Purchase Order created successfully",
      data: purchaseorder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getallpurchaseorders = async (req, res) => {
  try {
    // Pass full user object and assigned users (needs to be fetched if manager)
    // For now, we assume req.user is populated. 
    // We need to fetch assignedUsers if role is manager.
    // However, rbac.helpers might need raw user document or just ids.
    // Let's pass req.user and req.organizationId and let service handle logic.
    const { getAssignedUsers } = require('../services/user.service'); // circular dependency risk?

    // Better: let service handle user fetching if needed.
    const purchaseorders = await purchaseorderservice.getallpurchaseorders(req.user, req.organizationId);
    res.status(200).json(purchaseorders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getpurchaseorderbyid = async (req, res) => {
  try {
    const purchaseorder = await purchaseorderservice.getpurchaseorderbyid(
      req.params.id,
      req.user,
      req.organizationId
    );
    if (!purchaseorder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.status(200).json(purchaseorder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const approvepurchaseorder = async (req, res) => {
  try {
    const purchaseorder = await purchaseorderservice.approvepurchaseorder(
      req.params.id,
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Purchase order approved successfully",
      data: purchaseorder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const receivepurchaseorder = async (req, res) => {
  try {
    const result = await purchaseorderservice.receivepurchaseorder(
      req.params.id,
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Purchase order received successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deletepurchaseorder = async (req, res) => {
  try {
    const result = await purchaseorderservice.deletepurchaseorder(
      req.params.id,
      req.user
    );
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createpurchaseorder,
  getallpurchaseorders,
  getpurchaseorderbyid,
  approvepurchaseorder,
  receivepurchaseorder,
  deletepurchaseorder
};
