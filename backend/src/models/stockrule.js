const mongoose = require("mongoose");

const stockruleschema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "warehouse",
    required: true
  },
  minStock: {
    type: Number,
    required: true,
    min: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

const stockrule =  mongoose.model("StockRule", stockruleschema);
module.exports = stockrule;

