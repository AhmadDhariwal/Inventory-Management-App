const Product = require("../models/product");
const Supplier = require("../models/supplier");
const PurchaseOrder = require("../models/purchaseorder");

const getdashboardstats = async () => {
  const totalproducts = await Product.countDocuments();
  const totalsuppliers = await Supplier.countDocuments();

  const totalstock = await Product.aggregate([
    { $group: { _id: null, total: { $sum: "$stockquantity" } } }
  ]);

  const totalpurchases = await PurchaseOrder.aggregate([
    { $group: { _id: null, total: { $sum: "$totalamount" } } }
  ]);

  const lowstockproducts = await Product.find({
    stockquantity: { $lte: "$minstocklevel" }
  }).select("name sku stockquantity minstocklevel");

  return {
    totalproducts,
    totalsuppliers,
    totalstock: totalstock[0]?.total || 0,
    totalpurchases: totalpurchases[0]?.total || 0,
    lowstockproducts
  };
};

module.exports = { getdashboardstats };
