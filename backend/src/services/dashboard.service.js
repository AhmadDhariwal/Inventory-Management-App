// const Product = require("../models/product");
// const Supplier = require("../models/supplier");
// const stockmovement = require("../models/stockmovement.js")
// const PurchaseOrder = require("../models/purchaseorder");
// const StockLevel = require("../models/stocklevel.js");

// const getdashboardstats = async () => {
//   const totalproducts = await Product.countDocuments();
//   const totalsuppliers = await Supplier.countDocuments();

//   const stockAggregation = await stockmovement.aggregate([
//       {
//         $group: {
//           _id: "$product",
//           availableQty: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$type", "IN"] },
//                 "$quantity",
//                 { $multiply: ["$quantity", -1] }
//               ]
//             }
//           }
//         }
//       }
//     ]);
  
//     const totalStock = stockAggregation.reduce(
//       (sum, item) => sum + item.availableQty,
//       0
//     );
//   const totalpurchases = await PurchaseOrder.aggregate([
//     { $group: { _id: null, total: { $sum: "$totalamount" } } }
//   ]);

//   // const lowstockproducts = await Product.find({
//   //   stockquantity: { $lte: "$minstocklevel" }
//   // }).select("name sku stockquantity minstocklevel");


//   const lowStockItems = await StockLevel.aggregate([
//   {
//     $lookup: {
//       from: "products",
//       localField: "product",
//       foreignField: "_id",
//       as: "product"
//     }
//   },
//   { $unwind: "$product" },
//   {
//     $match: {
//       $expr: { $lte: ["$quantity", "$product.minstocklevel"] }
//     }
//   },
//   {
//     $project: {
//       productName: "$product.name",
//       sku: "$product.sku",
//       availableQty: "$quantity",
//       minStock: "$product.minstocklevel"
//     }
//   }
// ]);

//   return {
//     totalproducts,
//     totalsuppliers,
//     totalStock, //: totalstock[0]?.total || 0,
//     totalpurchases: totalpurchases[0]?.total || 0,
//     lowStockItems
//   };
// };


const Product = require('../models/product.model');
const Supplier = require('../models/supplier.model');
const Purchase = require('../models/purchase.model');
const StockMovement = require('../models/stockMovement.model');
const StockLevel = require('../models/stockLevel.model');

exports.getDashboardSummary = async () => {

  /* =======================
     1️⃣ KPI SECTION
  ======================== */

  const [
    totalProducts,
    totalSuppliers,
    totalPurchaseAmount,
    totalStockQty
  ] = await Promise.all([
    Product.countDocuments(),
    Supplier.countDocuments(),
    Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    StockLevel.aggregate([
      { $group: { _id: null, qty: { $sum: "$quantity" } } }
    ])
  ]);

  /* =======================
     2️⃣ LOW STOCK ALERTS
  ======================== */

  const lowStockItems = await StockLevel.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $match: {
        $expr: { $lte: ['$quantity', '$product.minStockLevel'] }
      }
    },
    {
      $project: {
        productName: '$product.name',
        sku: '$product.sku',
        availableQty: '$quantity',
        minStock: '$product.minStockLevel'
      }
    }
  ]);

  /* =======================
     3️⃣ WIDGET DATA
  ======================== */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stockInToday = await StockMovement.aggregate([
    {
      $match: {
        type: 'IN',
        createdAt: { $gte: today }
      }
    },
    {
      $group: {
        _id: null,
        qty: { $sum: '$quantity' }
      }
    }
  ]);

  const stockOutToday = await StockMovement.aggregate([
    {
      $match: {
        type: 'OUT',
        createdAt: { $gte: today }
      }
    },
    {
      $group: {
        _id: null,
        qty: { $sum: '$quantity' }
      }
    }
  ]);

  const pendingPurchases = await Purchase.countDocuments({ status: 'PENDING' });

  /* =======================
     4️⃣ CHART DATA (BASIC)
  ======================== */

  const stockTrend = await StockMovement.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        qty: { $sum: '$quantity' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  /* =======================
     FINAL RESPONSE
  ======================== */

  return {
    kpis: {
      totalProducts,
      totalSuppliers,
      totalStockQty: totalStockQty[0]?.qty || 0,
      totalPurchaseAmount: totalPurchaseAmount[0]?.total || 0
    },
    alerts: {
      lowStockCount: lowStockItems.length,
      lowStockItems
    },
    widgets: {
      pendingPurchases,
      stockInToday: stockInToday[0]?.qty || 0,
      stockOutToday: stockOutToday[0]?.qty || 0
    },
    charts: {
      stockTrend
    }
  };
};

//module.exports = { getdashboardstats };
