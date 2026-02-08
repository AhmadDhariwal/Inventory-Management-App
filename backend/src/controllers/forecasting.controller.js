const forecastingService = require('../services/forecasting.service');

const getProductForecast = async (req, res) => {
    try {
        const { productId } = req.params;
        const organizationId = req.organizationId;

        const forecast = await forecastingService.predictStockDepletion(productId, organizationId);
        res.json({ success: true, data: forecast });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLowStockForecasts = async (req, res) => {
    try {
        const organizationId = req.organizationId;
        const forecasts = await forecastingService.getLowStockForecast(organizationId);
        res.json({ success: true, data: forecasts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProductForecast,
    getLowStockForecasts
};
