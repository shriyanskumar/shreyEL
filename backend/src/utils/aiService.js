/**
 * AI Service Utility
 * Handles HTTP calls to the AI module endpoints
 */

const axios = require('axios');
const logger = require('./logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

class AIService {
  /**
   * Generate summary for document content
   * @param {string} content - Document text
   * @param {string} category - Document category
   * @returns {Promise<Object>} Summary result with key points, actions, scores
   */
  static async generateSummary(content, category = 'other') {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/summarize`, {
        content,
        category
      });
      return response.data;
    } catch (error) {
      logger.error('AI Service - Generate Summary Error:', error.message);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Extract key points from document
   * @param {string} content - Document text
   * @param {number} numPoints - Number of key points to extract
   * @returns {Promise<Object>} Object with key_points array
   */
  static async extractKeyPoints(content, numPoints = 5) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/extract-key-points`, {
        content,
        num_points: numPoints
      });
      return response.data;
    } catch (error) {
      logger.error('AI Service - Extract Key Points Error:', error.message);
      throw new Error(`Failed to extract key points: ${error.message}`);
    }
  }

  /**
   * Analyze text for readability and importance
   * @param {string} content - Document text
   * @returns {Promise<Object>} Object with readability_score and importance
   */
  static async analyzeText(content) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/analyze-text`, {
        content
      });
      return response.data;
    } catch (error) {
      logger.error('AI Service - Analyze Text Error:', error.message);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  }

  /**
   * Health check for AI module
   * @returns {Promise<boolean>} True if AI service is reachable
   */
  static async healthCheck() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      logger.warn('AI Service - Health Check Failed:', error.message);
      return false;
    }
  }
}

module.exports = AIService;
