const SalesOrder = require("../models/salesorder");
const Product = require("../models/product");
const StockMovement = require("../models/stockmovement");
const Inventory = require("../models/model");
const StockLevel = require("../models/stocklevel");

const createsalesorder = async (data, userId) => {
  const { items } = data;

  let totalamount = 0;
  let totalquantity = 0;

  // Check each item against current stock
  for (let item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error("Product not found");
    }

    // Get current inventory
    const inventory = await Inventory.findOne({
      product: item.product,
      warehouse: item.warehouse
    });

    const currentStock = inventory ? inventory.quantity : 0;

    // Check if sufficient stock available
    if (currentStock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${item.quantity}`);
    }

    // Auto-deduct stock (always enabled)
    if (inventory) {
      inventory.quantity -= item.quantity;
      await inventory.save();
    }

    // Update stock level
    const stockLevel = await StockLevel.findOne({
      product: item.product,
      warehouse: item.warehouse
    });

    if (stockLevel) {
      stockLevel.quantity -= item.quantity;
      await stockLevel.save();
    }

    // Create stock movement
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
    status: 'pending'
  });

  return salesorder;
};

const getallsalesorders = async () => {
  try {
    return await SalesOrder.find().populate("items.product");
  } catch (error) {
    throw new Error("Error fetching sales orders: " + error.message);
  }
};

module.exports = { 
  createsalesorder,
  getallsalesorders
};
