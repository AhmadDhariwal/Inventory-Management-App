const StockRule = require("../models/stockrule");

const createstockrule = async (req, res) => {
  try {
    const stockrule = await StockRule.create(req.body);
    res.status(201).json(stockrule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getstockrules = async (req, res) => {
  try {
    const stockrules = await StockRule.find()
      .populate("product", "name sku")
      .populate("warehouse", "name");
    res.json(stockrules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getstockruleById = async (req, res) => {
  try {
    const stockrule = await StockRule.findById(req.params.id)
      .populate("product", "name sku")
      .populate("warehouse", "name");
    if (!stockrule) {
      return res.status(404).json({ message: "Stock rule not found" });
    }
    res.json(stockrule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatestockrule = async (req, res) => {
  try {
    const stockrule = await StockRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("product", "name sku").populate("warehouse", "name");
    res.json(stockrule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletestockrule = async (req, res) => {
  try {
    await StockRule.findByIdAndDelete(req.params.id);
    res.json({ message: "Stock rule deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createstockrule,
  getstockrules,
  getstockruleById,
  updatestockrule,
  deletestockrule
};