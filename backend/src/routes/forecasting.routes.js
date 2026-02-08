const express = require('express');
const router = express.Router();
const forecastingController = require('../controllers/forecasting.controller');

router.get('/products/:productId', forecastingController.getProductForecast);
router.get('/low-stock', forecastingController.getLowStockForecasts);

module.exports = router;
