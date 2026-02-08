const SalesOrder = require("../models/salesorder");
const Product = require("../models/product");
const StockMovement = require("../models/stockmovement");
const Inventory = require("../models/model");
const StockLevel = require("../models/stocklevel");
const User = require("../models/user");
const { getOrganizationFilter, getOrganizationPipeline } = require("../utils/rbac.helpers");

const createsalesorder = async (data, userId, organizationId) => {
  const { items } = data;

  if (!userId) throw new Error("User ID is required");
  if (!organizationId) throw new Error("Organization ID is required");

  let totalamount = 0;
  let totalquantity = 0;

  // Check each item against current stock
  for (let item of items) {
    const product = await Product.findOne({ _id: item.product, organizationId });

    if (!product) {
      throw new Error("Product not found");
    }

    // Get current inventory
    const inventory = await Inventory.findOne({
      product: item.product,
      warehouse: item.warehouse,
      organizationId
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
      warehouse: item.warehouse,
      organizationId
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
      organizationId // Critical: Add organizationId
    });

    // Ensure numeric calculation
    item.total = item.quantity * (item.sellingPrice || product.price || 0);
    totalquantity += item.quantity;
    totalamount += item.total;
  }

  const salesorder = await SalesOrder.create({
    items,
    totalamount,
    createdBy: userId,
    organizationId, // Critical: Add organizationId
    status: 'pending' // Should probably be 'completed' for sales? Or 'pending' payment? keeping 'pending' as per original
  });

  await salesorder.populate('createdBy', 'name');

  return salesorder;
};

const getallsalesorders = async (user, organizationId) => {
  try {
    // RBAC Filtering
    let assignedUsers = [];
    if (user.role === 'manager') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc ? userDoc.assignedUsers : [];
    }

    const filter = getOrganizationFilter(user, assignedUsers, 'createdBy');

    return await SalesOrder.find(filter)
      .populate("items.product", "name sku price")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching sales orders: " + error.message);
  }
};

module.exports = {
  createsalesorder,
  getallsalesorders
};
