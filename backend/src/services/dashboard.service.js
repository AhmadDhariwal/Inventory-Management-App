// // const Product = require("../models/product");
// // const Supplier = require("../models/supplier");
// // const stockmovement = require("../models/stockmovement.js")
// // const PurchaseOrder = require("../models/purchaseorder");
// // const StockLevel = require("../models/stocklevel.js");

// // const getdashboardstats = async () => {
// //   const totalproducts = await Product.countDocuments();
// //   const totalsuppliers = await Supplier.countDocuments();

// //   const stockAggregation = await stockmovement.aggregate([
// //       {
// //         $group: {
// //           _id: "$product",
// //           availableQty: {
// //             $sum: {
// //               $cond: [
// //                 { $eq: ["$type", "IN"] },
// //                 "$quantity",
// //                 { $multiply: ["$quantity", -1] }
// //               ]
// //             }
// //           }
// //         }
// //       }
// //     ]);
  
// //     const totalStock = stockAggregation.reduce(
// //       (sum, item) => sum + item.availableQty,
// //       0
// //     );
// //   const totalpurchases = await PurchaseOrder.aggregate([
// //     { $group: { _id: null, total: { $sum: "$totalamount" } } }
// //   ]);

// //   // const lowstockproducts = await Product.find({
// //   //   stockquantity: { $lte: "$minstocklevel" }
// //   // }).select("name sku stockquantity minstocklevel");


// //   const lowStockItems = await StockLevel.aggregate([
// //   {
// //     $lookup: {
// //       from: "products",
// //       localField: "product",
// //       foreignField: "_id",
// //       as: "product"
// //     }
// //   },
// //   { $unwind: "$product" },
// //   {
// //     $match: {
// //       $expr: { $lte: ["$quantity", "$product.minstocklevel"] }
// //     }
// //   },
// //   {
// //     $project: {
// //       productName: "$product.name",
// //       sku: "$product.sku",
// //       availableQty: "$quantity",
// //       minStock: "$product.minstocklevel"
// //     }
// //   }
// // ]);

// //   return {
// //     totalproducts,
// //     totalsuppliers,
// //     totalStock, //: totalstock[0]?.total || 0,
// //     totalpurchases: totalpurchases[0]?.total || 0,
// //     lowStockItems
// //   };
// // };


// const Product = require('../models/product');
// const Supplier = require('../models/supplier');
// const PurchaseOrder = require('../models/purchaseorder');
// const StockMovement = require('../models/stockmovement');
// const StockLevel = require('../models/stocklevel');

// exports.getDashboardSummary = async () => {

//   /* =======================
//      1️⃣ KPI SECTION
//   ======================== */

//   const [
//     totalProducts,
//     totalSuppliers,
//     totalPurchaseAmount,
//     totalStockQty
//   ] = await Promise.all([
//     Product.countDocuments(),
//     Supplier.countDocuments(),
//     PurchaseOrder.aggregate([
//       { $group: { _id: null, total: { $sum: "$totalamount" } } }
//     ]),
//     StockLevel.aggregate([
//       { $group: { _id: null, qty: { $sum: "$quantity" } } }
//     ])
//   ]);

//   /* =======================
//      2️⃣ LOW STOCK ALERTS
//   ======================== */

//   const lowStockItems = await StockLevel.aggregate([
//     {
//       $lookup: {
//         from: 'products',
//         localField: 'product',
//         foreignField: '_id',
//         as: 'product'
//       }
//     },
//     { $unwind: '$product' },
//     {
//       $match: {
//         $expr: { $lte: ['$quantity', '$minStock'] }
//       }
//     },
//     {
//       $project: {
//         productName: '$product.name',
//         sku: '$product.sku',
//         availableQty: '$quantity',
//         minStock: '$minStock'
//       }
//     }
//   ]);

//   /* =======================
//      3️⃣ WIDGET DATA
//   ======================== */

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const stockInToday = await StockMovement.aggregate([
//     {
//       $match: {
//         type: 'IN',
//         createdAt: { $gte: today }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         qty: { $sum: '$quantity' }
//       }
//     }
//   ]);

//   const stockOutToday = await StockMovement.aggregate([
//     {
//       $match: {
//         type: 'OUT',
//         createdAt: { $gte: today }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         qty: { $sum: '$quantity' }
//       }
//     }
//   ]);

//   const pendingPurchases = await PurchaseOrder.countDocuments({ status: 'PENDING' });

//   /* =======================
//      4️⃣ CHART DATA (BASIC)
//   ======================== */

//   const stockTrend = await StockMovement.aggregate([
//     {
//       $group: {
//         _id: { $month: '$createdAt' },
//         qty: { $sum: '$quantity' }
//       }
//     },
//     { $sort: { '_id': 1 } }
//   ]);

//   /* =======================
//      FINAL RESPONSE
//   ======================== */

//   return {
//     kpis: {
//       totalProducts,
//       totalSuppliers,
//       totalStockQty: totalStockQty[0]?.qty || 0,
//       totalPurchaseAmount: totalPurchaseAmount[0]?.total || 0
//     },
//     alerts: {
//       lowStockCount: lowStockItems.length,
//       lowStockItems
//     },
//     widgets: {
//       pendingPurchases,
//       stockInToday: stockInToday[0]?.qty || 0,
//       stockOutToday: stockOutToday[0]?.qty || 0
//     },
//     charts: {
//       stockTrend
//     }
//   };
// };

// //module.exports = { getdashboardstats };


const Product = require('../models/product');
const Supplier = require('../models/supplier');
const PurchaseOrder = require('../models/purchaseorder');
const StockMovement = require('../models/stockmovement');
const StockLevel = require('../models/stocklevel');

exports.getDashboardSummary = async () => {
  try {
    // Get basic counts
    const totalProducts = await Product.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    
    // Get total purchase amount
    const purchaseAmount = await PurchaseOrder.aggregate([
      { $group: { _id: null, total: { $sum: "$totalamount" } } }
    ]);
    
    // Get total stock quantity
    const stockQty = await StockLevel.aggregate([
      { $group: { _id: null, qty: { $sum: "$quantity" } } }
    ]);

    // Get low stock items
    const lowStockItems = await StockLevel.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouse',
          foreignField: '_id',
          as: 'warehouseInfo'
        }
      },
      {
        $match: {
          $expr: { 
            $and: [
              { $gt: ["$minStock", 0] },
              { $lte: ["$quantity", "$minStock"] }
            ]
          }
        }
      },
      {
        $project: {
          productId: "$product",
          productName: { $arrayElemAt: ["$productInfo.name", 0] },
          sku: { $arrayElemAt: ["$productInfo.sku", 0] },
          warehouseName: { $arrayElemAt: ["$warehouseInfo.name", 0] },
          availableQty: "$quantity",
          minStock: "$minStock"
        }
      }
    ]);

    // Get today's stock movements
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stockInToday = await StockMovement.aggregate([
      {
        $match: {
          type: 'IN',
          createdAt: { $gte: today, $lt: tomorrow }
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
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          qty: { $sum: '$quantity' }
        }
      }
    ]);

    // Get pending purchases
    const pendingPurchases = await PurchaseOrder.countDocuments({ 
      status: { $in: ['PENDING', 'pending'] }
    });

    return {
      kpis: {
        totalProducts: totalProducts || 0,
        totalSuppliers: totalSuppliers || 0,
        totalStockQty: stockQty[0]?.qty || 0,
        totalPurchaseAmount: purchaseAmount[0]?.total || 0
      },
      alerts: {
        lowStockCount: lowStockItems.length || 0,
        lowStockItems: lowStockItems || []
      },
      widgets: {
        pendingPurchases: pendingPurchases || 0,
        stockInToday: stockInToday[0]?.qty || 0,
        stockOutToday: stockOutToday[0]?.qty || 0
      }
    };
  } catch (error) {
    console.error('Dashboard service error:', error);
    // Return default values on error
    return {
      kpis: {
        totalProducts: 0,
        totalSuppliers: 0,
        totalStockQty: 0,
        totalPurchaseAmount: 0
      },
      alerts: {
        lowStockCount: 0,
        lowStockItems: []
      },
      widgets: {
        pendingPurchases: 0,
        stockInToday: 0,
        stockOutToday: 0
      }
    };
  }
};
