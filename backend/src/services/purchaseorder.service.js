const Purchaseorder = require("../models/purchaseorder");
const Product = require("../models/product");
const Supplier = require("../models/supplier");
const StockMovement = require("../models/stockmovement");

const createpurchaseorder = async (data, userId) => {
  const { supplier, items, warehouse, totalamount } = data;

  if (!warehouse) {
    throw new Error("Warehouse is required for purchase order");
  }
  
  const supplierexists = await Supplier.findById(supplier);
  if (!supplierexists || supplierexists.isactive === false) {
    throw new Error("Supplier not found or inactive");
  }

  for (let item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error("Product not found");
    }

    await StockMovement.create({
      product: item.product,
      warehouse: warehouse,
      type: "IN",
      quantity: item.quantity,
      reason: "PURCHASE",
      user: userId,
    });
  }

  const purchaseorder = await Purchaseorder.create({
    supplier,
    items,
    warehouse,
    totalamount,
    createdBy: userId,
  });

  return purchaseorder;
};

const getallpurchaseorders = async () => {
  return await Purchaseorder.find()
    .populate("supplier", "name")
    .populate("warehouse", "name")
    .populate("items.product", "name sku")
    .populate("createdBy", "name");
};
module.exports = { 
  createpurchaseorder,
  getallpurchaseorders
 };
