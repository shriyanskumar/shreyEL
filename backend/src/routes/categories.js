const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

// Public list (but will return user-specific if authenticated)
router.get('/', protect, categoryController.getCategories);
router.post('/', protect, categoryController.createCategory);
router.put('/:id', protect, categoryController.updateCategory);
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;
