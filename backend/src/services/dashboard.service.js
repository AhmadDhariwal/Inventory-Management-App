const Product = require("../models/product");
const Supplier = require("../models/supplier");
const stockmovement = require("../models/stockmovement.js")
const PurchaseOrder = require("../models/purchaseorder");

const getdashboardstats = async () => {
  const totalproducts = await Product.countDocuments();
  const totalsuppliers = await Supplier.countDocuments();

  const stockAggregation = await stockmovement.aggregate([
      {
        $group: {
          _id: "$product",
          availableQty: {
            $sum: {
              $cond: [
                { $eq: ["$type", "IN"] },
                "$quantity",
                { $multiply: ["$quantity", -1] }
              ]
            }
          }
        }
      }
    ]);
  
    const totalStock = stockAggregation.reduce(
      (sum, item) => sum + item.availableQty,
      0
    );
  const totalpurchases = await PurchaseOrder.aggregate([
    { $group: { _id: null, total: { $sum: "$totalamount" } } }
  ]);

  const lowstockproducts = await Product.find({
    stockquantity: { $lte: "$minstocklevel" }
  }).select("name sku stockquantity minstocklevel");

  return {
    totalproducts,
    totalsuppliers,
    totalStock, //: totalstock[0]?.total || 0,
    totalpurchases: totalpurchases[0]?.total || 0,
    lowstockproducts
  };
};

module.exports = { getdashboardstats };
