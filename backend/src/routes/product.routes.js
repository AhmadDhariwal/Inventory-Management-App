const express = require("express");
const router = express.Router();
const product = require("../models/product");
const Category = require("../models/category");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// GET all products - Scoped to Organization
router.get("/", verifytoken, async (req, res) => {
  try {
    const products = await product.find({ organizationId: req.organizationId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product - Scoped to Organization
router.get("/:id", verifytoken, async (req, res) => {
  try {
    const productData = await product.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('category', 'name');

    if (!productData) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE product - Allow admin, manager, and user
router.post("/", verifytoken, restrictto(['admin', 'manager', 'user']), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      organizationId: req.organizationId,
      createdBy: req.userid
    };

    // Check for duplicate SKU in organization
    const existingProduct = await product.findOne({ sku: req.body.sku, organizationId: req.organizationId });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this SKU already exists in your organization' });
    }

    const newProduct = new product(productData);
    await newProduct.save();
    const populatedProduct = await product.findById(newProduct._id).populate('category', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE product - Allow admin, manager, and user
router.put("/:id", verifytoken, restrictto(['admin', 'manager', 'user']), async (req, res) => {
  try {
    const updatedProduct = await product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE product - Admin and Manager only (Users should not delete)
router.delete("/:id", verifytoken, restrictto(['admin', 'manager']), async (req, res) => {
  try {
    const deletedProduct = await product.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
