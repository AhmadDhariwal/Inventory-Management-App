const Supplier = require("../models/supplier");


exports.createsupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getsuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getsupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updatesupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.disablesupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json({ message: "Supplier disabled", supplier });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
