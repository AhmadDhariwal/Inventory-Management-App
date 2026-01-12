const SalesOrder = require("../models/salesorder");
const Product = require("../models/product");
const StockMovement = require("../models/stockmovement");

const createsalesorder = async (data, userId) => {
  const { items } = data;

  let totalamount = 0;
  let totalquantity = 0;

  for (let item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock for product: ${product.name}`
      );
    }

    product.stockQuantity -= item.quantity;
    await product.save();

    // Stock movement (OUT)
    await StockMovement.create({
      product: item.product,
      warehouse: item.warehouse || null,
      type: "OUT",
      quantity: item.quantity,
      reason: "SALE",
      user: userId,
    });
    
    item.total = item.quantity * item.sellingPrice;
    totalquantity += item.quantity;
    totalamount += item.total;
  }

  const salesorder = await SalesOrder.create({
    items,
    totalamount,
    createdBy: userId,
  });

  return salesorder;
};

module.exports = { createsalesorder };
