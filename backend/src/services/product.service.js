const Product = require('../models/product');

exports.getTotalActiveProducts = async () => {
  return await Product.countDocuments({ isActive: true });
};
