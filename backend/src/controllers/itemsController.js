const express = require('express');
const inventoryschema = require("../models/model");
const shortid = require('shortid');
const signup = require('../models/user');
// const Product = require('../models/product'); // Assuming inventoryschema is the product model

async function createitem(req, res) {
  try {
    const body = req.body;
    if (!body.name || !body.quantity || !body.price || !body.category) {
      return res.status(400).json({ error: "Data is required" });
    }

    // Validate organizationId
    if (!req.organizationId) {
      return res.status(400).json({ error: "Organization context missing" });
    }

    const createditem = await inventoryschema.create({
      name: body.name,
      quantity: body.quantity,
      price: body.price,
      category: body.category,
      createdby: req.userid,
      organizationId: req.organizationId // Add organization context
    })
    res.status(201).json({
      message: "Item created successfully",
      item: createditem,
    });

  }
  catch (err) {
    console.error("createitem error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getitems(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Base filter: Always scope by organizationId
    let filter = { organizationId: req.organizationId };

    if (req.role === 'admin' || req.role === 'manager') {
      // Admins and Managers see all items in the organization
      // Keep base filter
      if (search && search.trim() !== "") {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      }
    }

    if (req.role === 'user') {
      // Users: Keep existing logic (only see own items) + Organization Scope
      // Verify if users should see all org items or just theirs. 
      // Based on previous code: filter = {createdby : req.userid};
      // We will respect that restriction for now but ADD organization scope.
      filter.createdby = req.userid;

      if (search && search.trim() !== "") {
        filter.$and = [
          // Already in filter object: { organizationId: ..., createdby: ... }
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { category: { $regex: search, $options: "i" } }
            ]
          }
        ];
      }
    }

    const skip = (page - 1) * limit;

    const items = await inventoryschema
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ updatedAt: -1 })
      .sort({ createdAt: -1 });

    const total = await inventoryschema.countDocuments(filter);

    return res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      items
    });

  }
  catch (err) {
    console.error("Get Items:", err);
    return res.status(500).json({ error: "Server Error" });
  }
}

async function getbyid(req, res) {
  try {

    const searchid = req.params.id;

    if (!searchid) {
      return res.status(400).json({ error: "bad request" });
    }

    // Scope by organizationId
    const entry = await inventoryschema.findOne({ _id: searchid, organizationId: req.organizationId });


    if (!entry) return res.status(404).json({ error: "Not found " });
    return res.json(entry);
  }
  catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


async function getall(req, res) {
  try {
    // Scope by organizationId
    const inventory = await inventoryschema.find({ organizationId: req.organizationId });
    return res.json(inventory);
  }
  catch (err) {
    console.error("Get Items : ", err);
    res.status(500).json({ error: "Server Error" });

  }
};

async function updatebyid(req, res) {
  try {

    const body = req.body;
    const updateid = req.params.id;

    if (!body) {
      return res.status(400).json({ error: "Not an Updated term" });
    }

    // Scope by organizationId
    const data = await inventoryschema.findOneAndUpdate(
      { _id: updateid, organizationId: req.organizationId },
      {
        $set: {
          name: String(body.name),
          price: Number(body.price),
          quantity: Number(body.quantity),
          category: String(body.category),
        }
      },
      { new: true }
    );
    if (!data) return res.status(404).json({ error: "Not found " });

    return res.status(201).json({
      data,
    });

  }

  catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

async function deletebyid(req, res) {
  try {
    const searchid = req.params.id;

    if (!searchid) {
      return res.status(400).json({ error: "bad request" });

    }
    // Scope by organizationId
    const entry = await inventoryschema.findOneAndDelete({ _id: searchid, organizationId: req.organizationId });

    if (!entry) return res.status(404).json({ error: "Not found " });
    return res.status(201).json({
      message: "Item deleted Successfully",
      deletedIte: entry
    });
  }
  catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Deprecated or Admin-only Global User List? 
// If this is for "User Management", it should be in user controller.
// If valid here, Must be scoped to organization.
async function getallusers(req, res) {
  try {
    // Scope by organizationId
    // Note: 'signup' model is likely the User model. 
    // If req.organizationId is present, use it.
    const query = req.organizationId ? { organizationId: req.organizationId } : {};

    const users = await signup.find(query);
    return res.json(users);
  }
  catch (err) {
    console.error("Get Items : ", err);
    res.status(500).json({ error: "Server Error" });

  }
};



module.exports = {
  createitem,
  getitems,
  getbyid,
  getall,
  updatebyid,
  deletebyid,
  getallusers,
}