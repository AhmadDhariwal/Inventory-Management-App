const StockMovement = require('../models/stockmovement');
const Product = require('../models/product');
const StockLevel = require('../models/stocklevel');
const mongoose = require('mongoose');

/**
 * Calculate the average daily consumption for a product
 * @param {string} productId 
 * @param {string} organizationId 
 * @param {number} daysLookback 
 */
const calculateAverageDailyConsumption = async (productId, organizationId, daysLookback = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);

    const movements = await StockMovement.find({
        product: productId,
        organizationId: organizationId,
        type: 'OUT',
        createdAt: { $gte: startDate }
    });

    if (movements.length === 0) return 0;

    const totalOut = movements.reduce((sum, m) => sum + m.quantity, 0);
    return totalOut / daysLookback;
};

/**
 * Predict when a product will run out of stock
 * @param {string} productId 
 * @param {string} organizationId 
 */
const predictStockDepletion = async (productId, organizationId) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    // Aggregate stock across all warehouses
    const stockLevels = await StockLevel.find({
        product: productId,
        organizationId: organizationId
    });

    const currentStock = stockLevels.reduce((sum, sl) => sum + (sl.quantity || 0), 0);
    const reorderPoint = stockLevels.reduce((sum, sl) => sum + (sl.reorderLevel || 0), 0);

    const avgDaily = await calculateAverageDailyConsumption(productId, organizationId);

    if (avgDaily <= 0) {
        return {
            productId,
            productName: product.name,
            currentStock,
            avgDailyConsumption: 0,
            daysRemaining: Infinity,
            prediction: 'Insufficient data or no consumption'
        };
    }

    const daysRemaining = currentStock / avgDaily;
    const daysToReorder = (currentStock - reorderPoint) / avgDaily;

    return {
        productId,
        productName: product.name,
        currentStock,
        avgDailyConsumption: parseFloat(avgDaily.toFixed(2)),
        daysRemaining: parseFloat(daysRemaining.toFixed(1)),
        daysToReorder: parseFloat(Math.max(0, daysToReorder).toFixed(1)),
        predictionDate: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000)
    };
};

/**
 * Get forecasting for all low stock products in an organization
 * @param {string} organizationId 
 */
const getLowStockForecast = async (organizationId) => {
    // Find products where total stock is below total reorder level
    const stockItems = await StockLevel.find({ organizationId });

    // Group by product
    const productStock = {};
    stockItems.forEach(item => {
        const pid = item.product.toString();
        if (!productStock[pid]) {
            productStock[pid] = { current: 0, reorder: 0 };
        }
        productStock[pid].current += item.quantity || 0;
        productStock[pid].reorder += item.reorderLevel || 0;
    });

    const lowStockPids = Object.keys(productStock).filter(pid =>
        productStock[pid].current <= productStock[pid].reorder
    );

    const forecasts = await Promise.all(
        lowStockPids.map(pid => predictStockDepletion(pid, organizationId))
    );

    return forecasts;
};

module.exports = {
    calculateAverageDailyConsumption,
    predictStockDepletion,
    getLowStockForecast
};
