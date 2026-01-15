/**
 * Summary Controller
 * Handles AI-based document summarization operations
 */

const Summary = require("../models/Summary");
const Document = require("../models/Document");
const AIService = require("../utils/aiService");
const logger = require("../utils/logger");

/**
 * Generate and save summary for a document
 * POST /api/summaries/generate
 */
exports.generateSummary = async (req, res) => {
  try {
    const { documentId } = req.body;

    // Validate input
    if (!documentId) {
      return res.status(400).json({ error: "Document ID is required" });
    }

    // Fetch document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check if user owns the document (optional security check)
    if (document.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to summarize this document" });
    }

    // Check if summary already exists
    const existingSummary = await Summary.findOne({ document: documentId });
    if (existingSummary) {
      // Delete existing summary to regenerate
      await Summary.findByIdAndDelete(existingSummary._id);
    }

    logger.info(`Generating summary for document: ${documentId}`);
    logger.info(`Document fileUrl: ${document.fileUrl || 'NOT SET'}`);

    // Build content from available document fields
    const contentParts = [];
    if (document.title) contentParts.push(`Title: ${document.title}`);
    if (document.description)
      contentParts.push(`Description: ${document.description}`);

    const content = contentParts.join("\n") || "Document uploaded for tracking";

    logger.info(`Sending to AI - content length: ${content.length}, fileUrl: ${document.fileUrl || 'none'}`);

    // Call AI service to generate summary (send fileUrl for document parsing)
    const aiResult = await AIService.generateSummary(
      content,
      document.category || "other",
      document.fileUrl || ""
    );

    // Save summary to database
    const summary = new Summary({
      document: documentId,
      summary: aiResult.summary,
      keyPoints: aiResult.key_points,
      suggestedActions: aiResult.suggested_actions,
      importance: aiResult.importance,
      readabilityScore: aiResult.readability_score,
      generatedBy: "ai-module",
    });

    await summary.save();
    logger.info(`Summary saved for document: ${documentId}`);

    res.status(201).json({
      message: "Summary generated successfully",
      summary: summary,
    });
  } catch (error) {
    logger.error("Generate Summary Error:", error.message);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate summary" });
  }
};

/**
 * Get summary for a document
 * GET /api/summaries/:documentId
 */
exports.getSummary = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Find summary
    const summary = await Summary.findOne({ document: documentId }).populate(
      "document",
      "title category"
    );

    if (!summary) {
      return res
        .status(404)
        .json({ error: "Summary not found for this document" });
    }

    // Check authorization
    const document = await Document.findById(documentId);
    if (document.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this summary" });
    }

    res.status(200).json(summary);
  } catch (error) {
    logger.error("Get Summary Error:", error.message);
    res.status(500).json({ error: "Failed to retrieve summary" });
  }
};

/**
 * Get all summaries for user's documents
 * GET /api/summaries
 */
exports.getAllSummaries = async (req, res) => {
  try {
    // Find all documents for this user
    const documents = await Document.find({ owner: req.user.id });
    const documentIds = documents.map((doc) => doc._id);

    // Find summaries for these documents
    const summaries = await Summary.find({
      document: { $in: documentIds },
    }).populate("document", "title category status");

    res.status(200).json({
      count: summaries.length,
      summaries: summaries,
    });
  } catch (error) {
    logger.error("Get All Summaries Error:", error.message);
    res.status(500).json({ error: "Failed to retrieve summaries" });
  }
};

/**
 * Delete summary
 * DELETE /api/summaries/:summaryId
 */
exports.deleteSummary = async (req, res) => {
  try {
    const { summaryId } = req.params;

    const summary = await Summary.findById(summaryId);
    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    // Verify authorization
    const document = await Document.findById(summary.document);
    if (document.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this summary" });
    }

    await Summary.findByIdAndDelete(summaryId);
    logger.info(`Summary deleted: ${summaryId}`);

    res.status(200).json({ message: "Summary deleted successfully" });
  } catch (error) {
    logger.error("Delete Summary Error:", error.message);
    res.status(500).json({ error: "Failed to delete summary" });
  }
};
