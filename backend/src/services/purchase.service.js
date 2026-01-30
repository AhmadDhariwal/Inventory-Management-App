const PurchaseOrder = require('../models/purchaseorder');

exports.getPendingPurchaseCount = async () => {
  return await PurchaseOrder.countDocuments({ status: 'PENDING' });
};
