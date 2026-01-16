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
const getlowstockreport = async (req, res) => {
  try {
    const report = await reportservice.getlowstockreport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getstockreport,
  getstockmovementreport,
  getpurchasereport,
  getstocklevelsreport,
  getlowstockreport
};
