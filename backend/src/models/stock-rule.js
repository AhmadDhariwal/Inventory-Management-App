const mongoose = require("mongoose");

const stockRuleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
    description: "Product reference"
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "warehouse",
    required: true,
    description: "Warehouse reference"
  },
  reorderLevel: {
    type: Number,
    default: 0,
    min: 0,
    description: "Reorder level for this product in this warehouse"
  },
  minStock: {
    type: Number,
    default: 0,
    min: 0,
    description: "Minimum stock level for this product in this warehouse"
  }
}, { 
  timestamps: true,
  collection: 'stock-rules'
});

// Ensure unique combination of product and warehouse
stockRuleSchema.index({ product: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model("ProductStockRule", stockRuleSchema);