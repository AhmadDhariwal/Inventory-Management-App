const Category = require('../models/category');

const getCategories = async (req, res) => {
  try {
    console.log('Getting categories...');
    // Scope by organizationId
    const query = { isActive: true };
    if (req.organizationId) {
      query.organizationId = req.organizationId;
    }

    const categories = await Category.find(query).sort({ name: 1 });
    console.log('Found categories:', categories.length);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    // Add organization context
    if (req.organizationId) {
      categoryData.organizationId = req.organizationId;
    }

    // Add createdBy if available
    if (req.userid) {
      categoryData.createdBy = req.userid;
    }

    const category = new Category(categoryData);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};