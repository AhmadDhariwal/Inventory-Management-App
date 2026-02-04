const Purchaseorder = require("../models/purchaseorder");
const Product = require("../models/product");
const Supplier = require("../models/supplier");
const StockMovement = require("../models/stockmovement");
const StockLevel = require("../models/stocklevel");
const Inventory = require("../models/model");

const createpurchaseorder = async (data, userId) => {
  const { supplier, items, warehouse, totalamount } = data;
  
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (!warehouse) throw new Error("Warehouse is required");

  const supplierexists = await Supplier.findById(supplier);
  if (!supplierexists || !supplierexists.isactive) {
    throw new Error("Supplier not found or inactive");
  }

  const purchaseorder = await Purchaseorder.create({
    supplier,
    items,
    warehouse,
    totalamount,
    createdBy: userId,
    status: "PENDING"
  });

  await purchaseorder.populate('createdBy', 'name');
  
  return purchaseorder;
};

const processPurchaseOrderReceipt = async (purchaseOrderId, userId) => {
  const purchaseorder = await Purchaseorder.findById(purchaseOrderId);
  if (!purchaseorder) throw new Error("Purchase order not found");

  for (let item of purchaseorder.items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product not found");

    // Create stock movement
    await StockMovement.create({
      product: item.product,
      warehouse: purchaseorder.warehouse,
      type: "IN",
      quantity: item.quantity,
      reason: "PURCHASE",
      referenceId: purchaseorder._id,
      user: userId,
    });

    // Update inventory
    const inventory = await Inventory.findOne({
      product: item.product,
      warehouse: purchaseorder.warehouse
    });

    if (inventory) {
      inventory.quantity += item.quantity;
      await inventory.save();
    } else {
      await Inventory.create({
        product: item.product,
        warehouse: purchaseorder.warehouse,
        quantity: item.quantity
      });
    }

    // Update stock level
    const stock = await StockLevel.findOne({
      product: item.product,
      warehouse: purchaseorder.warehouse
    });

    if (stock) {
      stock.quantity += item.quantity;
      await stock.save();
    } else {
      await StockLevel.create({
        product: item.product,
        warehouse: purchaseorder.warehouse,
        quantity: item.quantity,
        reservedQuantity: 0,
        reorderLevel: 0,
        minStock: 0
      });
    }
  }

  // Update purchase order status
  purchaseorder.status = "RECEIVED";
  purchaseorder.receivedAt = new Date();
  await purchaseorder.save();

  return { purchaseorder };
};

const getallpurchaseorders = async () => {
  return await Purchaseorder.find()
    .populate("supplier", "name")
    .populate("items.product", "name sku")
    .populate("warehouse", "name")
    .populate("createdBy", "name");
};

const getpurchaseorderbyid = async (id) => {
  return await Purchaseorder.findById(id)
    .populate("supplier", "name email")
    .populate("items.product", "name sku")
    .populate("warehouse", "name")
    .populate("createdBy", "name");
};

// Approve purchase order
const approvepurchaseorder = async (id, userId) => {
  const purchaseorder = await Purchaseorder.findById(id);
  if (!purchaseorder) throw new Error("Purchase order not found");
  
  if (purchaseorder.status !== "PENDING") {
    throw new Error("Only pending purchase orders can be approved");
  }

  purchaseorder.status = "APPROVED";
  purchaseorder.approvedAt = new Date();
  purchaseorder.approvedBy = userId;
  await purchaseorder.save();

  return purchaseorder;
};

// Receive purchase order manually
const receivepurchaseorder = async (id, userId) => {
  const purchaseorder = await Purchaseorder.findById(id);
  if (!purchaseorder) throw new Error("Purchase order not found");
  
  if (purchaseorder.status !== "APPROVED") {
    throw new Error("Only approved purchase orders can be received");
  }

  return await processPurchaseOrderReceipt(id, userId);
};

// Delete purchase order
const deletepurchaseorder = async (id, userId) => {
  try {
    const purchaseorder = await Purchaseorder.findById(id);
    if (!purchaseorder) {
      throw new Error("Purchase order not found");
    }

    // Check if order is already received - prevent deletion of received orders
    if (purchaseorder.status === "RECEIVED") {
      throw new Error("Cannot delete received purchase orders. Please create a return instead.");
    }

    // Delete the purchase order
    await Purchaseorder.findByIdAndDelete(id);
    
    return { message: "Purchase order deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete purchase order: ${error.message}`);
  }
};

module.exports = { 
  createpurchaseorder,
  getallpurchaseorders,
  getpurchaseorderbyid,
  approvepurchaseorder,
  receivepurchaseorder,
  processPurchaseOrderReceipt,
  deletepurchaseorder
};
