const Purchase = require("../models/purchaseorder");
const Product = require("../models/product");
const Supplier = require("../models/supplier");
const StockMovement = require("../models/stockmovement");

const createpurchase = async (data, userId) => {
  const { supplier, items } = data;

  
  const supplierexists = await Supplier.findById(supplier);
  if (!supplierexists || supplierexists.status === "inactive") {
    throw new Error("Supplier not found or inactive");
  }

  let totalAmount = 0;

  for (let item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error("Product not found");
    }

    product.stockQuantity += item.quantity;
    await product.save();

    await StockMovement.create({
      product: item.product,
      type: "IN",
      quantity: item.quantity,
      reason: "PURCHASE",
      user: userId,
    });

    totalAmount += item.quantity * item.costPrice;
  }

  // 3. Save purchase
  const purchase = await purchaseorder.create({
    supplier,
    items,
    totalAmount,
    createdBy: userId,
  });

  return purchase;
};

module.exports = { createpurchase };
