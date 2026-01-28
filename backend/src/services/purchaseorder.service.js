const Purchaseorder = require("../models/purchaseorder");
const Product = require("../models/product");
const Supplier = require("../models/supplier");
const StockMovement = require("../models/stockmovement");
const StockLevel = require("../models/stocklevel");
const Inventory = require("../models/model");
const stockRuleService = require("./stockrule.service");

const createpurchaseorder = async (data, userId) => {
  const { supplier, items, warehouse, totalamount } = data;

  if (!warehouse) throw new Error("Warehouse is required");

  const supplierexists = await Supplier.findById(supplier);
  if (!supplierexists || !supplierexists.isactive) {
    throw new Error("Supplier not found or inactive");
  }

  // Check if auto-receive is enabled
  const shouldAutoReceive = await stockRuleService.shouldAutoReceivePurchase();
  const status = shouldAutoReceive ? "RECEIVED" : "PENDING";

  // Create Purchase Order
  const purchaseorder = await Purchaseorder.create({
    supplier,
    items,
    warehouse,
    totalamount,
    createdBy: userId,
    status
  });

  // Process stock updates if auto-receive is enabled
  if (shouldAutoReceive) {
    await processPurchaseOrderReceipt(purchaseorder._id, userId);
  }

  return purchaseorder;
};

// New: Process purchase order receipt
const processPurchaseOrderReceipt = async (purchaseOrderId, userId) => {
  const purchaseorder = await Purchaseorder.findById(purchaseOrderId);
  if (!purchaseorder) throw new Error("Purchase order not found");

  const warnings = [];

  for (let item of purchaseorder.items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product not found");

    // Validate stock transaction (adding stock)
    try {
      const validation = await stockRuleService.validateStockTransaction(
        item.product,
        purchaseorder.warehouse,
        item.quantity,
        'add'
      );
      warnings.push(...validation.warnings);
    } catch (error) {
      console.warn(`Stock validation warning: ${error.message}`);
    }

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

    // Update stock level (legacy support)
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
        quantity: item.quantity
      });
    }
  }

  // Update purchase order status
  purchaseorder.status = "RECEIVED";
  purchaseorder.receivedAt = new Date();
  await purchaseorder.save();

  return { purchaseorder, warnings };
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

// New: Receive purchase order manually
const receivepurchaseorder = async (id, userId) => {
  return await processPurchaseOrderReceipt(id, userId);
};

// New: Delete purchase order
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
  receivepurchaseorder,
  processPurchaseOrderReceipt,
  deletepurchaseorder
};
