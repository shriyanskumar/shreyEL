const Category = require('../models/Category');
const Document = require('../models/Document');
const logger = require('../utils/logger');

exports.getCategories = async (req, res) => {
  try {
    // Optionally return only user's categories if authenticated
    const filter = {};
    if (req.user && req.user.id) filter.owner = req.user.id;
    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    logger.error('Get Categories Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim(), owner: req.user ? req.user.id : null });
    if (existing) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = new Category({
      name: name.trim(),
      color: color || '#757575',
      icon: icon || '📁',
      owner: req.user ? req.user.id : undefined
    });
    await category.save();
    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    logger.error('Create Category Error:', error.message);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (name) category.name = name.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon;

    await category.save();
    res.status(200).json({ message: 'Category updated', category });
  } catch (error) {
    logger.error('Update Category Error:', error.message);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Prevent deletion if documents reference this category
    const linked = await Document.countDocuments({ categoryId: id });
    if (linked > 0) {
      return res.status(400).json({ error: 'Category in use by documents. Reassign or remove documents first.' });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    logger.error('Delete Category Error:', error.message);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
