const Category = require('../models/category');

const getCategories = async (req, res) => {
  try {
    console.log('Getting categories...');
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    console.log('Found categories:', categories.length);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory
};