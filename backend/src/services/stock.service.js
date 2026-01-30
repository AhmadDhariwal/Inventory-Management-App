const StockLevel = require('../models/stocklevel');
const StockMovement = require('../models/stockmovement');

exports.getStockSummary = async () => {
  const totalStockQty = await StockLevel.aggregate([
    { $group: { _id: null, qty: { $sum: '$quantity' } } }
  ]);

  const lowStockItems = await StockLevel.find({
    $expr: { $lte: ['$quantity', '$minStock'] }
  }).populate('product', 'name sku');

  return {
    totalStockQty: totalStockQty[0]?.qty || 0,
    lowStockCount: lowStockItems.length,
    lowStockItems
  };
};

exports.getTodayStockMovements = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [inQty, outQty] = await Promise.all([
    StockMovement.aggregate([
      { $match: { type: 'IN', createdAt: { $gte: today } } },
      { $group: { _id: null, qty: { $sum: '$quantity' } } }
    ]),
    StockMovement.aggregate([
      { $match: { type: 'OUT', createdAt: { $gte: today } } },
      { $group: { _id: null, qty: { $sum: '$quantity' } } }
    ])
  ]);

  return {
    stockInToday: inQty[0]?.qty || 0,
    stockOutToday: outQty[0]?.qty || 0
  };
};
