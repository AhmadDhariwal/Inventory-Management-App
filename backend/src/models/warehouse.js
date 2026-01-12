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
  }
}, { timestamps: true });

const warehouse = mongoose.model("warehouse", warehouseschema);

module.exports = warehouse;
