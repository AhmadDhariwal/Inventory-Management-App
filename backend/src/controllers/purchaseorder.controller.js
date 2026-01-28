const express = require ("express");
const purchaseorderservice = require("../services/purchaseorder.service");

const createpurchaseorder = async (req, res) => {
  try {
    const purchaseorder = await purchaseorderservice.createpurchaseorder(
      req.body,
      req.user.id
    );

    res.status(201).json({
      message: "Purchase Order created successfully",
      data: purchaseorder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getallpurchaseorders = async (req,res) => {
try{
   const purchaseorder = await purchaseorderservice.getallpurchaseorders();
    res.status(200).json(purchaseorder);
}
catch(error){
    res.status(400).json({error:error.message});
}
}

const getpurchaseorderbyid = async (req, res) => {
  try {
    const purchaseorder = await purchaseorderservice.getpurchaseorderbyid(req.params.id);
    if (!purchaseorder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.status(200).json(purchaseorder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletepurchaseorder = async (req, res) => {
  try {
    const result = await purchaseorderservice.deletepurchaseorder(
      req.params.id,
      req.user.id
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

module.exports = { createpurchaseorder,
  getallpurchaseorders,
  getpurchaseorderbyid,
  deletepurchaseorder
 };
