const mongoose = require("mongoose");

const supplierschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    contactperson: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      lowercase: true
    },

    phone: {
      type: String
    },

    address: {
      type: String
    },

    paymentterms: {
      type: String,
      enum: ["CASH", "NET_15", "NET_30", "NET_60"],
      default: "CASH"
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
  },
  { timestamps: true }
);

// Index for organization-scoped queries
supplierschema.index({ organizationId: 1, isActive: 1 });

const supplier = mongoose.model("Supplier", supplierschema);
module.exports = supplier;
