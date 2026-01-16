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

const getstocklevelsreport = async () => {
  const levels = await StockMovement.aggregate([
    {
      $group: {
        _id: {
          product: "$product",
          warehouse: "$warehouse"
        },
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
    },
    {
      $lookup: {
        from: "products",
        localField: "_id.product",
        foreignField: "_id",
        as: "productInfo"
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
        productName: { $arrayElemAt: ["$productInfo.name", 0] },
        sku: { $arrayElemAt: ["$productInfo.sku", 0] },
        cost: { $arrayElemAt: ["$productInfo.cost", 0] },
        warehouseName: { $arrayElemAt: ["$warehouseInfo.name", 0] },
        availableQty: 1,
        totalValue: {
          $multiply: [
            "$availableQty",
            { $arrayElemAt: ["$productInfo.cost", 0] }
          ]
        },
        status: {
          $cond: [
            { $lte: ["$availableQty", 10] },
            "CRITICAL",
            { $cond: [{ $lte: ["$availableQty", 30] }, "LOW", "OK"] }
          ]
        }
      }
    }
  ]);

  return levels;
};
const getlowstockreport = async () => {
  const lowStock = await StockMovement.aggregate([
    {
      $group: {
        _id: {
          product: "$product",
          warehouse: "$warehouse"
        },
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
    },
    {
      $lookup: {
        from: "stockrules",
        let: { product: "$_id.product", warehouse: "$_id.warehouse" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$product", "$$product"] },
                  { $eq: ["$warehouse", "$$warehouse"] }
                ]
              }
            }
          }
        ],
        as: "rule"
      }
    },
    { $unwind: "$rule" },
    {
      $match: {
        $expr: {
          $lte: ["$availableQty", "$rule.minStock"]
        }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id.product",
        foreignField: "_id",
        as: "productInfo"
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
        productName: { $arrayElemAt: ["$productInfo.name", 0] },
        sku: { $arrayElemAt: ["$productInfo.sku", 0] },
        warehouseName: { $arrayElemAt: ["$warehouseInfo.name", 0] },
        availableQty: 1,
        minStock: "$rule.minStock",
        status: "LOW"
      }
    }
  ]);

  return lowStock;
};


module.exports = {
  getstockreport,
  getstockmovementreport,
  getpurchasereport,
  getstocklevelsreport,
  getlowstockreport
};
