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
  }
}, { timestamps: true });

const stockmovement = mongoose.model("stockmovement", stockmovementschema);

module.exports =  stockmovement;
