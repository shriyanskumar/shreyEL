/**
 * Simple Logger Utility
 * Provides logging methods for debugging and error tracking
 */

const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },
  error: (message, data) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data || '');
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
};

module.exports = logger;
