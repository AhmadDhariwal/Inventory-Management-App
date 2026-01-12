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
  },
  { timestamps: true }
);

const salesorder= mongoose.model("SalesOrder", salesorderschema);
module.exports = salesorder;