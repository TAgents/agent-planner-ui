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
  
  // Supabase Configuration
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
};

export default API_CONFIG;
