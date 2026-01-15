/**
 * Document Controller
 * Handles document CRUD operations and file management
 */

const Document = require('../models/Document');
const Reminder = require('../models/Reminder');
const AIService = require('../utils/aiService');
const logger = require('../utils/logger');

/**
 * Get all documents for the current user
 * GET /api/documents
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const { status, category, categoryId, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { owner: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (categoryId) filter.categoryId = categoryId;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch documents
    const documents = await Document.find(filter)
      .populate('categoryId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ uploadedAt: -1 });

    const total = await Document.countDocuments(filter);

    res.status(200).json({
      documents,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error('Get All Documents Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
};

/**
 * Get document by ID
 * GET /api/documents/:id
 */
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('owner', 'username email firstName lastName')
      .populate('categoryId');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check authorization
    if (document.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this document' });
    }

    res.status(200).json(document);
  } catch (error) {
    logger.error('Get Document Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
};

/**
 * Create/upload new document
 * POST /api/documents
 */
exports.createDocument = async (req, res) => {
  try {
    const { title, description, category, categoryId, expiryDate, fileUrl } = req.body;

    logger.info(`Creating document - fileUrl received: ${fileUrl || 'NONE'}`);

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Document title is required' });
    }

    // Create document
    const document = new Document({
      title: title.trim(),
      description: description || '',
      category: category || 'other',
      categoryId: categoryId || null,
      owner: req.user.id,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      fileUrl: fileUrl || '',
      fileName: fileUrl ? fileUrl.split('/').pop() : `document-${Date.now()}`,
      fileSize: 0,
      mimeType: 'application/octet-stream',
      status: 'submitted',
      uploadedAt: new Date()
    });

    logger.info(`Document object fileUrl: ${document.fileUrl}`);

    // If categoryId was provided, try to fetch category name for convenience
    if (categoryId) {
      try {
        const Category = require('../models/Category');
        const cat = await Category.findById(categoryId);
        if (cat) {
          document.category = cat.name;
        }
      } catch (catErr) {
        // ignore
      }
    }

    await document.save();
    logger.info(`Document created: ${document._id}`);

    // If expiry date is set, create a reminder
    if (expiryDate) {
      try {
        const reminderDate = new Date(expiryDate);
        reminderDate.setDate(reminderDate.getDate() - 30); // 30 days before expiry

        const reminder = new Reminder({
          document: document._id,
          user: req.user.id,
          reminderType: 'expiry',
          reminderDate,
          daysBeforeExpiry: 30,
          notificationMethod: 'both'
        });
        await reminder.save();
        logger.info(`Reminder created for document: ${document._id}`);
      } catch (reminderError) {
        logger.warn(`Could not create reminder: ${reminderError.message}`);
      }
    }

    res.status(201).json({
      message: 'Document created successfully',
      _id: document._id,
      title: document.title,
      category: document.category,
      status: document.status,
      expiryDate: document.expiryDate
    });
  } catch (error) {
    logger.error('Create Document Error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create document' });
  }
};

/**
 * Update document
 * PUT /api/documents/:id
 */
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, expiryDate, category, categoryId } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check authorization
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this document' });
    }

    // Update fields
    if (title) document.title = title;
    if (description) document.description = description;
    if (status) document.status = status;
    if (category) document.category = category;
    if (categoryId) {
      document.categoryId = categoryId;
      try {
        const Category = require('../models/Category');
        const cat = await Category.findById(categoryId);
        if (cat) document.category = cat.name;
      } catch (catErr) {
        // ignore
      }
    }
    if (expiryDate) document.expiryDate = new Date(expiryDate);
    document.updatedAt = Date.now();

    await document.save();
    logger.info(`Document updated: ${id}`);

    res.status(200).json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    logger.error('Update Document Error:', error.message);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check authorization
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this document' });
    }

    // Delete associated reminders
    await Reminder.deleteMany({ document: id });

    // Delete document
    await Document.findByIdAndDelete(id);
    logger.info(`Document deleted: ${id}`);

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Delete Document Error:', error.message);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

/**
 * Get document summary with AI analysis
 * GET /api/documents/:id/summary
 */
exports.getDocumentSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check authorization
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this document' });
    }

    logger.info(`Fetching summary for document: ${id}`);

    // Mock content for demo (in production, extract from file)
    const mockContent = `${document.title}. ${document.description || 'No description provided.'} Category: ${document.category}`;

    // Call AI service
    const summary = await AIService.generateSummary(mockContent, document.category);

    res.status(200).json({
      documentId: id,
      documentTitle: document.title,
      ...summary
    });
  } catch (error) {
    logger.error('Get Document Summary Error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate document summary' });
  }
};
