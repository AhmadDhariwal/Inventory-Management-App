const express = require("express");
const router = express.Router();
const product = require("../models/product");
const Category = require("../models/category");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// GET all products - Both admin and user can view
router.get("/", verifytoken, async (req, res) => {
  try {
    const products = await product.find().populate('category', 'name').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product - Both admin and user can view
router.get("/:id", verifytoken, async (req, res) => {
  try {
    const productData = await product.findById(req.params.id).populate('category', 'name');
    if (!productData) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE product - Admin only
router.post("/", verifytoken, restrictto(['admin']), async (req, res) => {
  try {
    const newProduct = new product(req.body);
    await newProduct.save();
    const populatedProduct = await product.findById(newProduct._id).populate('category', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE product - Admin only
router.put("/:id", verifytoken, restrictto(['admin']), async (req, res) => {
  try {
    const updatedProduct = await product.findByIdAndUpdate(
      req.params.id, 
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

// DELETE product - Admin only
router.delete("/:id", verifytoken, restrictto(['admin']), async (req, res) => {
  try {
    const deletedProduct = await product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
