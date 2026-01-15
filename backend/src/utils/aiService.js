/**
 * AI Service Utility
 * Built-in document summarization (no external service required)
 */

const logger = require("./logger");

class AIService {
  /**
   * Generate summary for document content
   * Uses built-in text analysis (works without external AI service)
   * @param {string} content - Document text
   * @param {string} category - Document category
   * @returns {Promise<Object>} Summary result with key points, actions, scores
   */
  static async generateSummary(content, category = "other") {
    try {
      // If no content, use the document title/description
      const text = content || "No content available for this document.";

      // Generate summary
      const summary = this.createSummary(text, category);
      const keyPoints = this.extractKeyPoints(text, category);
      const suggestedActions = this.getSuggestedActions(category);
      const readabilityScore = this.calculateReadability(text);
      const importance = this.assessImportance(text, category);

      return {
        summary,
        key_points: keyPoints,
        suggested_actions: suggestedActions,
        readability_score: readabilityScore,
        importance,
      };
    } catch (error) {
      logger.error("AI Service - Generate Summary Error:", error.message);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Create a summary from text
   */
  static createSummary(text, category) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const cleanSentences = sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    if (cleanSentences.length === 0) {
      return this.getCategorySummary(category);
    }

    // Take first 2-3 sentences as summary
    const summaryParts = cleanSentences.slice(0, 3);
    let summary = summaryParts.join(" ");

    // Add category context
    const categoryContext = {
      license: "This document appears to be a license or permit.",
      certificate: "This document is a certificate or credential.",
      permit: "This document grants permission or authorization.",
      insurance: "This document relates to insurance coverage.",
      contract: "This document is a legal agreement or contract.",
      tax: "This document relates to tax or financial matters.",
      identity: "This document is an identity or personal document.",
      other: "This document has been uploaded for tracking.",
    };

    return `${
      categoryContext[category] || categoryContext.other
    } ${summary}`.substring(0, 500);
  }

  /**
   * Get default summary based on category
   */
  static getCategorySummary(category) {
    const summaries = {
      license:
        "This is a license document. Please ensure it remains valid and renew before expiration.",
      certificate:
        "This certificate has been uploaded for record-keeping. Verify authenticity as needed.",
      permit:
        "This permit document grants specific authorization. Track expiry dates carefully.",
      insurance:
        "Insurance document uploaded. Review coverage details and premium due dates.",
      contract:
        "Legal contract stored for reference. Review terms and important deadlines.",
      tax: "Tax-related document. Keep for records and future reference during tax filing.",
      identity:
        "Identity document stored securely. Ensure it is renewed before expiration.",
      other:
        "Document uploaded successfully. Review and categorize for better organization.",
    };
    return summaries[category] || summaries.other;
  }

  /**
   * Extract key points from text
   */
  static extractKeyPoints(text, category) {
    const points = [];

    // Look for dates
    const datePattern =
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi;
    const dates = text.match(datePattern);
    if (dates && dates.length > 0) {
      points.push(`Important date(s) found: ${dates.slice(0, 2).join(", ")}`);
    }

    // Look for amounts/numbers
    const amountPattern =
      /\$[\d,]+(?:\.\d{2})?|\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD|INR|rupees?)/gi;
    const amounts = text.match(amountPattern);
    if (amounts && amounts.length > 0) {
      points.push(
        `Financial amount(s) mentioned: ${amounts.slice(0, 2).join(", ")}`
      );
    }

    // Category-specific points
    const categoryPoints = {
      license: [
        "Verify license number and validity",
        "Check renewal requirements",
      ],
      certificate: [
        "Confirm issuing authority",
        "Verify certificate authenticity",
      ],
      permit: ["Note permit conditions", "Track permit expiration"],
      insurance: ["Review coverage limits", "Note premium due dates"],
      contract: ["Review key terms and conditions", "Note important deadlines"],
      tax: ["Keep for tax filing purposes", "Note relevant tax year"],
      identity: ["Ensure document is current", "Store securely"],
      other: ["Review document contents", "Categorize appropriately"],
    };

    points.push(...(categoryPoints[category] || categoryPoints.other));

    // Add generic points if needed
    if (points.length < 3) {
      points.push("Document stored for future reference");
      points.push("Set reminder for important dates if applicable");
    }

    return points.slice(0, 5);
  }

  /**
   * Get suggested actions based on category
   */
  static getSuggestedActions(category) {
    const actions = {
      license: [
        "Set reminder 30 days before expiry",
        "Verify all details are correct",
        "Keep digital and physical copies",
      ],
      certificate: [
        "Verify with issuing authority if needed",
        "Add to professional portfolio",
        "Set renewal reminder if applicable",
      ],
      permit: [
        "Note all permit conditions",
        "Set expiry reminder",
        "Keep accessible for inspections",
      ],
      insurance: [
        "Review coverage annually",
        "Set premium payment reminders",
        "Update beneficiary information if needed",
      ],
      contract: [
        "Review all terms carefully",
        "Note key deadlines and milestones",
        "Consult legal advice if unclear",
      ],
      tax: [
        "Keep for minimum 7 years",
        "Organize by tax year",
        "Consult tax professional if needed",
      ],
      identity: [
        "Renew before expiration",
        "Keep secure backup copies",
        "Update address if moved",
      ],
      other: [
        "Review and categorize properly",
        "Set relevant reminders",
        "Keep organized for easy access",
      ],
    };

    return actions[category] || actions.other;
  }

  /**
   * Calculate readability score (0-100)
   */
  static calculateReadability(text) {
    if (!text || text.length < 10) return 75;

    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const syllables = words.reduce((count, word) => {
      return count + this.countSyllables(word);
    }, 0);

    if (words.length === 0 || sentences.length === 0) return 75;

    // Flesch Reading Ease formula (simplified)
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    let score =
      206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

    // Normalize to 0-100
    score = Math.max(0, Math.min(100, score));

    return Math.round(score);
  }

  /**
   * Count syllables in a word (approximate)
   */
  static countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");

    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * Assess document importance
   */
  static assessImportance(text, category) {
    // High importance categories
    const highImportance = [
      "license",
      "insurance",
      "contract",
      "identity",
      "tax",
    ];
    const mediumImportance = ["certificate", "permit"];

    if (highImportance.includes(category)) return "high";
    if (mediumImportance.includes(category)) return "medium";

    // Check text for importance indicators
    const urgentWords =
      /urgent|important|critical|deadline|expir|immediate|required|mandatory/gi;
    const matches = text.match(urgentWords);

    if (matches && matches.length >= 2) return "high";
    if (matches && matches.length >= 1) return "medium";

    return "low";
  }

  /**
   * Health check (always returns true for built-in service)
   */
  static async healthCheck() {
    return true;
  }
}

module.exports = AIService;
