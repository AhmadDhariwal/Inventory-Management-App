const mongoose = require('mongoose');

const inventorySettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  allowNegativeStock: {
    type: Boolean,
    default: false
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  criticalStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  enableLowStockAlert: {
    type: Boolean,
    default: true
  },
  autoUpdateStock: {
    type: Boolean,
    default: true
  },
  requireApprovalForRemoval: {
    type: Boolean,
    default: false
  },
  autoReceivePurchase: {
    type: Boolean,
    default: false
  },
  autoDeductSales: {
    type: Boolean,
    default: true
  },
  enableBarcodeScanning: {
    type: Boolean,
    default: true
  },
  trackSerialNumbers: {
    type: Boolean,
    default: false
  },
  trackBatchNumbers: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('InventorySettings', inventorySettingsSchema);