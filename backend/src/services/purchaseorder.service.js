const Purchaseorder = require("../models/purchaseorder");
const Product = require("../models/product");
const Supplier = require("../models/supplier");
const StockMovement = require("../models/stockmovement");

const createpurchaseorder = async (data, userId) => {
  const { supplier, items, warehouse } = data;

  if (!warehouse) {
    throw new Error("Warehouse is required for purchase order");
  }
  
  const supplierexists = await Supplier.findById(supplier);
  if (!supplierexists || supplierexists.status === "inactive") {
    throw new Error("Supplier not found or inactive");
  }
  let totalquantity = 0;
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
      warehouse: warehouse,
      type: "IN",
      quantity: item.quantity,
      reason: "PURCHASE",
      user: userId,
    });

    item.total= item.quantity * item.costprice;
    totalquantity += item.quantity; 
    totalAmount += item.total;
  }


  const purchaseorder = await Purchaseorder.create({
    supplier,
    items,
    warehouse,
    totalAmount,
    createdBy: userId,
  });

  return purchaseorder;
};

const getallpurchaseorders = async () => {
    return await Purchaseorder.find();
};
module.exports = { 
  createpurchaseorder,
  getallpurchaseorders
 };
