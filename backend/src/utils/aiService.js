/**
 * AI Service Utility
 * Handles HTTP calls to the AI module on Render
 */

const axios = require("axios");
const logger = require("./logger");

// AI service URL - set this in Vercel environment variables
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

class AIService {
  /**
   * Generate summary for document content using AI
   * @param {string} content - Document text
   * @param {string} category - Document category
   * @returns {Promise<Object>} Summary result with key points, actions, scores
   */
  static async generateSummary(content, category = "other") {
    try {
      logger.info(`Calling AI service at: ${AI_SERVICE_URL}/api/summarize`);

      const response = await axios.post(
        `${AI_SERVICE_URL}/api/summarize`,
        { content, category },
        {
          timeout: 60000,
          headers: { "Content-Type": "application/json" },
        }
      );

      logger.info("AI summary generated successfully");
      return response.data;
    } catch (error) {
      logger.error("AI Service - Generate Summary Error:", error.message);
      if (error.response) {
        logger.error(
          "AI Service Response Error:",
          error.response.status,
          error.response.data
        );
      }

      // Return fallback if AI service fails
      return {
        summary: `This ${category} document has been uploaded for tracking.`,
        key_points: [
          "Document stored successfully",
          "Review contents as needed",
        ],
        suggested_actions: ["Review document", "Set reminders for key dates"],
        readability_score: 75,
        importance: "medium",
      };
    }
  }

  /**
   * Health check for AI module
   * @returns {Promise<boolean>} True if AI service is reachable
   */
  static async healthCheck() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.warn("AI Service - Health Check Failed:", error.message);
      return false;
    }
  }
}

module.exports = AIService;
