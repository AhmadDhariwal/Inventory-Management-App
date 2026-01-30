const dashboardservice = require("../services/dashboard.service");

const getdashboardstats = async (req, res) => {
  try {
    const stats = await dashboardservice.getDashboardSummary();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getdashboardstats };
