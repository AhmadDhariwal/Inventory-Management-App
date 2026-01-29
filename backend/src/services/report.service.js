const Product = require("../models/product");
const StockMovement = require("../models/stockmovement");
const StockLevel = require("../models/stocklevel");
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
// const getstocklevelsreport = async () => {
//   const levels = await StockMovement.aggregate([
//     {
//       $group: {
//         _id: {
//           product: "$product",
//           warehouse: "$warehouse"
//         },
//         availableQty: {
//           $sum: {
//             $cond: [
//               { $eq: ["$type", "IN"] },
//               "$quantity",
//               { $multiply: ["$quantity", -1] }
//             ]
//           }
//         }
//       }
//     },
//     {
//       $lookup: {
//         from: "products",
//         localField: "_id.product",
//         foreignField: "_id",
//         as: "productInfo"
//       }
//     },
//     {
//       $lookup: {
//         from: "warehouses",
//         localField: "_id.warehouse",
//         foreignField: "_id",
//         as: "warehouseInfo"
//       }
//     },
//     {
//       $lookup: {
//         from: "categories",
//         localField: "productInfo.category",
//         foreignField: "_id",
//         as: "categoryInfo"
//       }
//     },
//     {
//       $lookup: {
//         from: "stockrules",
//         let: { product: "$_id.product", warehouse: "$_id.warehouse" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$product", "$$product"] },
//                   { $eq: ["$warehouse", "$$warehouse"] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "stockRule"
//       }
//     },
//     {
//       $project: {
//         productId: "$_id.product",
//         warehouseId: "$_id.warehouse",
//         productName: { $arrayElemAt: ["$productInfo.name", 0] },
//         sku: { $arrayElemAt: ["$productInfo.sku", 0] },
//         cost: { $arrayElemAt: ["$productInfo.cost", 0] },
//         category: { $arrayElemAt: ["$categoryInfo.name", 0] },
//         warehouseName: { $arrayElemAt: ["$warehouseInfo.name", 0] },
//         availableQty: 1,
//         reservedQty: { $literal: 0 },
//         reorderLevel: { $arrayElemAt: ["$stockRule.reorderLevel", 0] },
//         totalValue: {
//           $multiply: [
//             "$availableQty",
//             { $arrayElemAt: ["$productInfo.cost", 0] }
//           ]
//         },
//         status: {
//           $cond: [
//             { $lte: ["$availableQty", 10] },
//             "CRITICAL",
//             { $cond: [{ $lte: ["$availableQty", 30] }, "LOW", "OK"] }
//           ]
//         }
//       }
//     }
//   ]);

//   return levels;
// };
const getstocklevelsreport = async () => {
  // Get stock levels directly from StockLevel collection
  const stockLevels = await StockLevel.find()
    .populate('product', 'name sku cost price category')
    .populate('warehouse', 'name')
    .populate('product.category', 'name')
    .lean();

  const result = stockLevels.map(level => ({
    productId: level.product?._id,
    warehouseId: level.warehouse?._id,
    productName: level.product?.name || 'N/A',
    sku: level.product?.sku || 'N/A',
    cost: level.product?.cost || 0,
    price: level.product?.price || 0,
    category: level.product?.category?.name || 'Uncategorized',
    warehouseName: level.warehouse?.name || 'N/A',
    availableQty: level.quantity || 0,
    reservedQty: level.reservedQuantity || 0,
    minStock: level.minStock || 0,
    reorderLevel: level.reorderLevel || 0,
    totalValue: (level.quantity || 0) * (level.product?.cost || 0),
    status: (level.quantity || 0) <= (level.minStock || 0) ? 'LOW' : 'OK'
  }));

  return result;
};
// const getlowstockreport = async () => {
//   const lowStock = await StockMovement.aggregate([
//     {
//       $group: {
//         _id: {
//           product: "$product",
//           warehouse: "$warehouse"
//         },
//         availableQty: {
//           $sum: {
//             $cond: [
//               { $eq: ["$type", "IN"] },
//               "$quantity",
//               { $multiply: ["$quantity", -1] }
//             ]
//           }
//         }
//       }
//     },
//     {
//       $lookup: {
//         from: "stockrules",
//         let: { product: "$_id.product", warehouse: "$_id.warehouse" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$product", "$$product"] },
//                   { $eq: ["$warehouse", "$$warehouse"] }
//                 ]
//               }
//             }
//           }
//         ],
//         as: "rule"
//       }
//     },
//     { $unwind: "$rule" },
//     {
//       $match: {
//         $expr: {
//           $lte: ["$availableQty", "$rule.minStock"]
//         }
//       }
//     },
//     {
//       $lookup: {
//         from: "products",
//         localField: "_id.product",
//         foreignField: "_id",
//         as: "productInfo"
//       }
//     },
//     {
//       $lookup: {
//         from: "warehouses",
//         localField: "_id.warehouse",
//         foreignField: "_id",
//         as: "warehouseInfo"
//       }
//     },
//     {
//       $project: {
//         productId: "$_id.product",
//         warehouseId: "$_id.warehouse",
//         productName: { $arrayElemAt: ["$productInfo.name", 0] },
//         sku: { $arrayElemAt: ["$productInfo.sku", 0] },
//         warehouseName: { $arrayElemAt: ["$warehouseInfo.name", 0] },
//         availableQty: 1,
//         minStock: "$rule.minStock",
//         status: "LOW"
//       }
//     }
//   ]);

//   return lowStock;
// };
const getlowstockreport = async () => {
  // Get stock levels where quantity is less than or equal to minStock
  const lowStock = await StockLevel.find({
    $expr: { $lte: ["$quantity", "$minStock"] }
  })
    .populate('product', 'name sku')
    .populate('warehouse', 'name')
    .lean();

  const result = lowStock.map(level => ({
    productId: level.product?._id,
    warehouseId: level.warehouse?._id,
    productName: level.product?.name || 'N/A',
    sku: level.product?.sku || 'N/A',
    warehouseName: level.warehouse?.name || 'N/A',
    availableQty: level.quantity || 0,
    minStock: level.minStock || 0,
    reorderLevel: level.reorderLevel || 0,
    status: 'LOW'
  }));

  return result;
};

const getstocksummary = async () => {
  const totalProducts = await Product.countDocuments();
  const warehouses = await Warehouse.countDocuments({ isActive: true });

  const stockAggregation = await StockMovement.aggregate([
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

  // Use the existing low stock report function
  const lowStockReport = await getlowstockreport();
  const lowStockItems = lowStockReport.length;

  const inventoryValue = totalStock * 100; // approximate value

  return {
    totalProducts,
    totalStock,
    lowStockItems,
    warehouses,
    inventoryValue
  };
};


const exportStockMovementsCSV = async (filters = {}) => {
  const movements = await StockMovement.find()
    .populate("product", "name sku")
    .populate("warehouse", "name")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();

  const csvHeader = "Date,Product,SKU,Warehouse,Type,Quantity,Reason,User\n";
  const csvRows = movements.map(m => 
    `${new Date(m.createdAt).toLocaleDateString()},${m.product?.name || 'N/A'},${m.product?.sku || 'N/A'},${m.warehouse?.name || 'N/A'},${m.type},${m.quantity},${m.reason || 'N/A'},${m.user?.name || 'N/A'}`
  ).join('\n');
  
  return csvHeader + csvRows;
};

const exportStockMovementsExcel = async (filters = {}) => {
  const movements = await StockMovement.find()
    .populate("product", "name sku")
    .populate("warehouse", "name")
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();

  // Simple Excel format (CSV with .xlsx extension)
  const csvHeader = "Date,Product,SKU,Warehouse,Type,Quantity,Reason,User\n";
  const csvRows = movements.map(m => 
    `${new Date(m.createdAt).toLocaleDateString()},${m.product?.name || 'N/A'},${m.product?.sku || 'N/A'},${m.warehouse?.name || 'N/A'},${m.type},${m.quantity},${m.reason || 'N/A'},${m.user?.name || 'N/A'}`
  ).join('\n');
  
  return Buffer.from(csvHeader + csvRows);
};

const exportStockSummaryCSV = async (filters = {}) => {
  const summary = await getstocksummary();
  
  const csvContent = `Metric,Value
Total Products,${summary.totalProducts}
Total Stock,${summary.totalStock}
Low Stock Items,${summary.lowStockItems}
Warehouses,${summary.warehouses}
Inventory Value,${summary.inventoryValue}`;
  
  return csvContent;
};

const exportStockSummaryExcel = async (filters = {}) => {
  const summary = await getstocksummary();
  
  const csvContent = `Metric,Value
Total Products,${summary.totalProducts}
Total Stock,${summary.totalStock}
Low Stock Items,${summary.lowStockItems}
Warehouses,${summary.warehouses}
Inventory Value,${summary.inventoryValue}`;
  
  return Buffer.from(csvContent);
};

const exportPurchaseOrdersCSV = async (filters = {}) => {
  const orders = await PurchaseOrder.find()
    .populate("supplier", "name email")
    .populate("items.product", "name sku")
    .sort({ createdAt: -1 })
    .lean();

  const csvHeader = "Date,Reference,Supplier,Status,Total Amount,Items\n";
  const csvRows = orders.map(order => {
    const items = order.items.map(item => `${item.product?.name}(${item.quantity})`).join('; ');
    return `${new Date(order.createdAt).toLocaleDateString()},${order.reference},${order.supplier?.name || 'N/A'},${order.status},${order.totalAmount},"${items}"`;
  }).join('\n');
  
  return csvHeader + csvRows;
};

const exportPurchaseOrdersExcel = async (filters = {}) => {
  const orders = await PurchaseOrder.find()
    .populate("supplier", "name email")
    .populate("items.product", "name sku")
    .sort({ createdAt: -1 })
    .lean();

  const csvHeader = "Date,Reference,Supplier,Status,Total Amount,Items\n";
  const csvRows = orders.map(order => {
    const items = order.items.map(item => `${item.product?.name}(${item.quantity})`).join('; ');
    return `${new Date(order.createdAt).toLocaleDateString()},${order.reference},${order.supplier?.name || 'N/A'},${order.status},${order.totalAmount},"${items}"`;
  }).join('\n');
  
  return Buffer.from(csvHeader + csvRows);
};

const getproductreport = async (category) => {
  // Get all products first
  const products = await Product.find()
    .populate('category', 'name')
    .lean();

  // Calculate stock levels from stock movements
  const stockAggregation = await StockMovement.aggregate([
    {
      $group: {
        _id: {
          product: "$product",
          warehouse: "$warehouse"
        },
        quantity: {
          $sum: {
            $cond: [
              { $eq: ["$type", "IN"] },
              "$quantity",
              { $multiply: ["$quantity", -1] }
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: "warehouses",
        localField: "_id.warehouse",
        foreignField: "_id",
        as: "warehouseInfo"
      }
    },
    {
      $project: {
        productId: "$_id.product",
        warehouseId: "$_id.warehouse",
        warehouse: { $arrayElemAt: ["$warehouseInfo.name", 0] },
        quantity: "$quantity"
      }
    }
  ]);

  // Create a map of calculated stock levels by product ID
  const stockMap = new Map();
  stockAggregation.forEach(stock => {
    const key = stock.productId.toString();
    if (!stockMap.has(key)) {
      stockMap.set(key, []);
    }
    stockMap.get(key).push({
      warehouse: stock.warehouse || 'N/A',
      quantity: stock.quantity || 0
    });
  });

  // Get all warehouses for products without stock movements
  const warehouses = await Warehouse.find({ isActive: true }).select('name').lean();

  const result = [];
  
  products.forEach(product => {
    const productId = product._id.toString();
    const productStocks = stockMap.get(productId);
    
    if (productStocks && productStocks.length > 0) {
      // Product has stock movements
      productStocks.forEach(stock => {
        result.push({
          product: product.name || 'N/A',
          sku: product.sku || 'N/A',
          category: product.category?.name || 'N/A',
          warehouse: stock.warehouse,
          quantity: stock.quantity
        });
      });
    } else {
      // Product has no stock movements, show with 0 quantity for first warehouse
      result.push({
        product: product.name || 'N/A',
        sku: product.sku || 'N/A',
        category: product.category?.name || 'N/A',
        warehouse: warehouses[0]?.name || 'N/A',
        quantity: 0
      });
    }
  });

  return result;
};

module.exports = {
  getstockreport,
  getstockmovementreport,
  exportStockMovementsCSV,
  exportStockMovementsExcel,
  exportStockSummaryCSV,
  exportStockSummaryExcel,
  exportPurchaseOrdersCSV,
  exportPurchaseOrdersExcel,
  getpurchasereport,
  getstocklevelsreport,
  getlowstockreport,
  getstocksummary,
  getproductreport,
};
