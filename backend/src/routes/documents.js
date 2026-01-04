const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/documents
 * @desc    Get all documents for current user
 * @access  Private
 */
router.get('/', protect, documentController.getAllDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', protect, documentController.getDocumentById);

/**
 * @route   POST /api/documents
 * @desc    Create/upload new document
 * @access  Private
 */
router.post('/', protect, documentController.createDocument);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document
 * @access  Private
 */
router.put('/:id', protect, documentController.updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:id', protect, documentController.deleteDocument);

/**
 * @route   GET /api/documents/:id/summary
 * @desc    Get AI summary of document
 * @access  Private
 */
router.get('/:id/summary', protect, documentController.getDocumentSummary);

module.exports = router;
