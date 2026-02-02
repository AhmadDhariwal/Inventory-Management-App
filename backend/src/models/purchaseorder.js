const mongoose = require("mongoose");

const purchaseorderschema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
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
        costprice: {
          type: Number,
          required: true,
        },
      },
    ],
    totalamount: {
      type: Number,
      required: true,
    },
    warehouse : {
      type: mongoose.Schema.Types.ObjectId,
      ref:"warehouse",
      required:true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "RECEIVED", "CANCELLED"],
      default: "PENDING"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    approvedAt: {
      type: Date
    },
    receivedAt: {
      type: Date
    },
  },
  { timestamps: true }
);

const purchaseorder = mongoose.model("PurchaseOrder", purchaseorderschema);
module.exports= purchaseorder;
