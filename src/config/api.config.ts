/**
 * API Configuration
 * This file centralizes API configuration for easier maintenance
 */

export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: 'http://localhost:3000',
  
  // API Version prefix if needed
  VERSION: '',
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
