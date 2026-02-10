const mongoose = require("mongoose");

const warehouseschema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Multi-tenant fields
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, { timestamps: true });

// Index for organization-scoped queries
warehouseschema.index({ organizationId: 1, isActive: 1 });

const warehouse = mongoose.model("warehouse", warehouseschema);

module.exports = warehouse;
