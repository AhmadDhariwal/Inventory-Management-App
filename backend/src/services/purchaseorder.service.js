const Purchaseorder = require("../models/purchaseorder");
const Product = require("../models/product");
const Supplier = require("../models/supplier");
const StockMovement = require("../models/stockmovement");
const StockLevel = require("../models/stocklevel");

const createpurchaseorder = async (data, userId) => {
  const { supplier, items, warehouse, totalamount } = data;

  if (!warehouse) throw new Error("Warehouse is required");

  const supplierexists = await Supplier.findById(supplier);
  if (!supplierexists || !supplierexists.isactive) {
    throw new Error("Supplier not found or inactive");
  }

  // 1️⃣ Create Purchase Order FIRST
  const purchaseorder = await Purchaseorder.create({
    supplier,
    items,
    warehouse,
    totalamount,
    createdBy: userId,
    status: "RECEIVED"
  });

  // 2️⃣ Process stock updates
  for (let item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product not found");

    // Stock movement
    await StockMovement.create({
      product: item.product,
      warehouse,
      type: "IN",
      quantity: item.quantity,
      reason: "PURCHASE",
      referenceId: purchaseorder._id,
      user: userId,
    });

    // Stock level update
    const stock = await StockLevel.findOne({
      product: item.product,
      warehouse
    });

    if (stock) {
      stock.quantity += item.quantity;
      await stock.save();
    } else {
      await StockLevel.create({
        product: item.product,
        warehouse,
        quantity: item.quantity
      });
    }
  }

  return purchaseorder;
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

module.exports = { 
  createpurchaseorder,
  getallpurchaseorders,
  getpurchaseorderbyid
 };
