const mongoose = require("mongoose");

const salesorderschema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        sellingPrice: {
          type: Number,
          required: true,
        },
      },
    ],

    totalamount: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // Multi-tenant field
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// Index for organization-scoped queries
salesorderschema.index({ organizationId: 1, createdAt: -1 });

const salesorder = mongoose.model("SalesOrder", salesorderschema);
module.exports = salesorder;