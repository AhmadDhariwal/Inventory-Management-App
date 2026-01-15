const express = require("express");
const router = express.Router();
const product = require("../models/product");

router.get("/", async (req, res) => {
  try {
    const products = await product.find({ status: "active" }).select("_id name sku");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
