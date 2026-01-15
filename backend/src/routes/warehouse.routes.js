const express = require("express");
const router = express.Router();
const warehouse = require("../models/warehouse");

router.get("/", async (req, res) => {
  try {
    const warehouses = await warehouse.find({ isActive: true }).select("_id name address");
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
