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

    isactive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const supplier = mongoose.model("Supplier", supplierschema);
module.exports= supplier;
