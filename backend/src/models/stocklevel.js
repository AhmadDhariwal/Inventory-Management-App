const mongoose = require("mongoose");

const stocklevelschema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
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
  // Ensure unique combination of product and warehouse
  indexes: [
    { product: 1, warehouse: 1 },
    { unique: true, fields: ['product', 'warehouse'] }
  ]
});

// Create compound index for unique product-warehouse combination
stocklevelschema.index({ product: 1, warehouse: 1 }, { unique: true });

const StockLevel = mongoose.model("StockLevel", stocklevelschema);

module.exports = StockLevel;