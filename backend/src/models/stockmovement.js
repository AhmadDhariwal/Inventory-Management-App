const mongoose = require("mongoose");

const stockmovementschema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ["IN", "OUT", "ADJUSTMENT"],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  // Multi-tenant field
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, { timestamps: true });

// Indexes for efficient manager queries (organizationId + user)
stockmovementschema.index({ organizationId: 1, user: 1 });
stockmovementschema.index({ organizationId: 1, createdAt: -1 });

const stockmovement = mongoose.model("stockmovement", stockmovementschema);

module.exports = stockmovement;
