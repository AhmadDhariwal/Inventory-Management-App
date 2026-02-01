// const dashboardservice = require("../services/dashboard.service");

// const getdashboardstats = async (req, res) => {
//   try {
//     const stats = await dashboardservice.getDashboardSummary();
//     res.status(200).json(stats);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = { getdashboardstats };

const dashboardService = require('../services/dashboard.service');

exports.getdashboardstats = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardSummary();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStockTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await dashboardService.getStockTrend(days);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPurchaseTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await dashboardService.getPurchaseTrend(days);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await dashboardService.getSalesTrend(days);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

