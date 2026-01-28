const SalesOrder = require("../models/salesorder");
const Product = require("../models/product");
const StockMovement = require("../models/stockmovement");
const Inventory = require("../models/model");
const stockRuleService = require("./stockrule.service");

const createsalesorder = async (data, userId) => {
  const { items } = data;

  let totalamount = 0;
  let totalquantity = 0;
  const warnings = [];

  // RULE ENFORCEMENT: Check each item against stock rules
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

    // CRITICAL: Validate against stock rules
    try {
      const validation = await stockRuleService.validateStockTransaction(
        item.product,
        item.warehouse,
        item.quantity,
        'deduct'
      );
      
      // Add warnings to response
      warnings.push(...validation.warnings);
      
    } catch (error) {
      throw new Error(`Stock validation failed for ${product.name}: ${error.message}`);
    }

    // Check if auto-deduction is enabled
    const shouldAutoDeduct = await stockRuleService.shouldAutoDeductSales();
    
    if (shouldAutoDeduct) {
      // Update inventory
      if (inventory) {
        inventory.quantity -= item.quantity;
        await inventory.save();
      }

      // Update product stock (legacy support)
      if (product.stockQuantity >= item.quantity) {
        product.stockQuantity -= item.quantity;
        await product.save();
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
    }
    
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

  return {
    salesorder,
    warnings
  };
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
