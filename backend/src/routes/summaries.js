const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/summaries
 * @desc    Get all summaries for user's documents
 * @access  Private
 */
router.get('/', protect, summaryController.getAllSummaries);

/**
 * @route   GET /api/summaries/:documentId
 * @desc    Get summary for a specific document
 * @access  Private
 */
router.get('/:documentId', protect, summaryController.getSummary);

/**
 * @route   POST /api/summaries/generate
 * @desc    Generate AI summary for document
 * @access  Private
 */
router.post('/generate', protect, summaryController.generateSummary);

/**
 * @route   DELETE /api/summaries/:summaryId
 * @desc    Delete summary
 * @access  Private
 */
router.delete('/:summaryId', protect, summaryController.deleteSummary);

module.exports = router;
