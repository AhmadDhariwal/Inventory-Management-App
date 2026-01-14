const Product = require("../models/product");
const StockMovement = require("../models/stockmovement");
const User = require("../models/user");
const Warehouse = require("../models/warehouse");
const PurchaseOrder = require("../models/purchaseorder");


const getstockreport = async () => {
  const products = await Product.find()
    .select("name sku stockQuantity price")
    .lean();

  return products;
};

const getstockmovementreport = async () => {
  return await StockMovement.find()
    .populate("product", "name sku")
    .populate("warehouse", "name")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
};

const getpurchasereport = async () => {
  return await PurchaseOrder.find()
    .populate("supplier", "name email phone")
    .populate("items.product", "name sku")
    .sort({ createdAt: -1 })
    .lean();
};


module.exports = {
  getstockreport,
   getstockmovementreport,
   getpurchasereport
};
