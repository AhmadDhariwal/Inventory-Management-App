const reportservice = require("../services/report.service");

const getstockreport = async (req, res) => {
  try {
    const report = await reportservice.getstockreport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getstockmovementreport = async (req, res) => {
  try {
    const report = await reportservice.getstockmovementreport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportStockMovementsCSV = async (req, res) => {
  try {
    const csv = await reportservice.exportStockMovementsCSV(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-movements.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportStockMovementsExcel = async (req, res) => {
  try {
    const buffer = await reportservice.exportStockMovementsExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-movements.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportStockSummaryCSV = async (req, res) => {
  try {
    const csv = await reportservice.exportStockSummaryCSV(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-summary.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportStockSummaryExcel = async (req, res) => {
  try {
    const buffer = await reportservice.exportStockSummaryExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-summary.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getpurchasereport = async (req, res) => {
  try {
    const report = await reportservice.getpurchasereport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getstocklevelsreport = async (req, res) => {
  try {
    const report = await reportservice.getstocklevelsreport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getstocksummary = async (req, res) => {
  try {
    const summary = await reportservice.getstocksummary();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getlowstockreport = async (req, res) => {
  try {
    const report = await reportservice.getlowstockreport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportPurchaseOrdersCSV = async (req, res) => {
  try {
    const csv = await reportservice.exportPurchaseOrdersCSV(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=purchase-orders.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportPurchaseOrdersExcel = async (req, res) => {
  try {
    const buffer = await reportservice.exportPurchaseOrdersExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=purchase-orders.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  getstocksummary
};
