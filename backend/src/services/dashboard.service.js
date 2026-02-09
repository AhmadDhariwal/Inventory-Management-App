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
const SalesOrder = require('../models/salesorder');
const StockMovement = require('../models/stockmovement');
const StockLevel = require('../models/stocklevel');
const User = require('../models/user');
const { getOrganizationFilter, getOrganizationPipeline } = require('../utils/rbac.helpers');

exports.getDashboardSummary = async (user, organizationId) => {
  try {
    // Ensure organizationId is in user object for RBAC helpers
    user.organizationId = organizationId;

    let assignedUsers = [];
    if (user.role === 'manager' || user.role === 'user') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc?.assignedUsers || [];
    }

    const productFilter = { organizationId };
    const supplierFilter = { organizationId };
    const purchaseOrderFilter = getOrganizationFilter(user, assignedUsers, 'createdBy');
    const purchasePipelineMatch = getOrganizationPipeline(user, assignedUsers, 'createdBy');
    const stockPipelineMatch = [{ $match: { organizationId } }];
    const movementPipelineMatch = getOrganizationPipeline(user, assignedUsers, 'user');

    // 2. Execute Queries

    // Get basic counts
    const totalProducts = await Product.countDocuments(productFilter);
    const totalSuppliers = await Supplier.countDocuments(supplierFilter);

    // Get total purchase amount (only approved/received orders)
    // We need to merge our RBAC pipeline with the status filter
    const purchaseAmountPipeline = [
      ...purchasePipelineMatch,
      {
        $match: {
          status: { $in: ["APPROVED", "RECEIVED"] }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalamount" } } }
    ];

    const purchaseAmount = await PurchaseOrder.aggregate(purchaseAmountPipeline);

    // Get total stock quantity (Org wide)
    const stockQty = await StockLevel.aggregate([
      ...stockPipelineMatch,
      { $group: { _id: null, qty: { $sum: "$quantity" } } }
    ]);

    // Get low stock items (Org wide)
    const lowStockItems = await StockLevel.aggregate([
      ...stockPipelineMatch,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stockInToday = await StockMovement.aggregate([
      ...movementPipelineMatch,
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
      ...movementPipelineMatch,
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

    const pendingPurchases = await PurchaseOrder.countDocuments({
      ...purchaseOrderFilter,
      status: 'PENDING'
    });

    const approvedPurchases = await PurchaseOrder.countDocuments({
      ...purchaseOrderFilter,
      status: 'APPROVED'
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
        approvedPurchases: approvedPurchases || 0,
        stockInToday: stockInToday[0]?.qty || 0,
        stockOutToday: stockOutToday[0]?.qty || 0
      }
    };
  } catch (error) {
    throw error;
  }
};

// Stock Trend API
exports.getStockTrend = async (days = 30, user, organizationId) => {
  try {
    user.organizationId = organizationId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    let assignedUsers = [];
    if (user.role === 'manager') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc?.assignedUsers || [];
    }
    const movementPipelineMatch = getOrganizationPipeline(user, assignedUsers, 'user');

    const stockTrend = await StockMovement.aggregate([
      ...movementPipelineMatch,
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          movements: {
            $push: {
              type: "$type",
              quantity: "$quantity"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          movements: {
            $map: {
              input: ["IN", "OUT"],
              as: "type",
              in: {
                type: "$$type",
                quantity: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$movements",
                          cond: { $eq: ["$$this.type", "$$type"] }
                        }
                      },
                      in: "$$this.quantity"
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return stockTrend;
  } catch (error) {
    throw error;
  }
};

// Purchase Trend API
exports.getPurchaseTrend = async (days = 30, user, organizationId) => {
  try {
    user.organizationId = organizationId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    let assignedUsers = [];
    if (user.role === 'manager') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc?.assignedUsers || [];
    }
    const purchasePipelineMatch = getOrganizationPipeline(user, assignedUsers, 'createdBy');

    const purchaseTrend = await PurchaseOrder.aggregate([
      ...purchasePipelineMatch,
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalAmount: { $sum: "$totalamount" },
          totalQuantity: { $sum: "$totalquantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return purchaseTrend;
  } catch (error) {
    throw error;
  }
};

// Sales Trend API
exports.getSalesTrend = async (days = 30, user, organizationId) => {
  try {
    user.organizationId = organizationId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    let assignedUsers = [];
    if (user.role === 'manager') {
      const userDoc = await User.findById(user.userid);
      assignedUsers = userDoc?.assignedUsers || [];
    }
    const salesPipelineMatch = getOrganizationPipeline(user, assignedUsers, 'user');

    const salesTrend = await SalesOrder.aggregate([
      ...salesPipelineMatch,
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalRevenue: { $sum: "$totalamount" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return salesTrend;
  } catch (error) {
    throw error;
  }
};
