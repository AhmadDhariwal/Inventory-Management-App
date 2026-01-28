const mongoose = require("mongoose");

const stockRuleSchema = new mongoose.Schema({
  allowNegativeStock: {
    type: Boolean,
    default: false,
    description: "Allow stock to go below zero"
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0,
    description: "Minimum stock level before alert"
  },
  criticalStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
    description: "Critical stock level for urgent alerts"
  },
  enableLowStockAlert: {
    type: Boolean,
    default: true,
    description: "Enable low stock notifications"
  },
  autoUpdateStock: {
    type: Boolean,
    default: true,
    description: "Auto update stock on purchase/sales"
  },
  defaultWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    description: "Default warehouse for operations"
  },
  requireApprovalForRemoval: {
    type: Boolean,
    default: false,
    description: "Require approval for stock removal"
  },
  autoReceivePurchase: {
    type: Boolean,
    default: false,
    description: "Auto receive purchase orders"
  },
  autoDeductSales: {
    type: Boolean,
    default: true,
    description: "Auto deduct stock on sales"
  },
  enableBarcodeScanning: {
    type: Boolean,
    default: true,
    description: "Enable barcode scanning features"
  },
  trackSerialNumbers: {
    type: Boolean,
    default: false,
    description: "Track individual serial numbers"
  },
  trackBatchNumbers: {
    type: Boolean,
    default: false,
    description: "Track batch/lot numbers"
  }
}, { 
  timestamps: true,
  collection: 'stockrules'
});

// Ensure only one stock rule document exists
stockRuleSchema.index({}, { unique: true });

module.exports = mongoose.model("StockRule", stockRuleSchema);