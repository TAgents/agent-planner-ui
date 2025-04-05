/**
 * Helper functions for working with JWT tokens
 */

/**
 * Create a JWT token with the correct structure the backend expects
 * This token uses the exact format expected by the backend authentication middleware
 * The key fields are: userId, email
 * @returns A token with the correct structure
 */
export const createProperToken = () => {
  // Token with fields: {"userId":"8f4e72bb-e949-4584-babb-aeba16da15a1","email":"admin@example.com"}
  // This matches the format used in the login.sh script
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZjRlNzJiYi1lOTQ5LTQ1ODQtYmFiYi1hZWJhMTZkYTE1YTEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzODU1NDk0LCJleHAiOjE3NDY0NDc0OTR9.778-vwxYJIVduFcp0q0Mtjsv9Jh198ezwPVYn9c6rb8';
};

/**
 * Decode a JWT token without validating the signature
 * @param token The JWT token to decode
 * @returns The decoded payload
 */
export const decodeToken = (token: string) => {
  try {
    // Split the token into parts
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      throw new Error('Invalid token format');
    }
    
    // Base64 decode the payload
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Fix an invalid token structure if needed
 * @param token The original token that may have the wrong structure
 * @returns A fixed token with the correct structure
 */
export const fixTokenFormat = (token: string): string => {
  try {
    // First check if the token is already in the correct format
    const payload = decodeToken(token);
    
    // If the token doesn't have userId but has userId, fix it
    if (payload && !payload.userId && payload.userId) {
      // Create a fixed payload
      const fixedPayload = {
        ...payload,
        userId: payload.userId,
      };
      
      // Get the original header and signature (we don't modify these)
      const [header,, signature] = token.split('.');
      
      // Encode the fixed payload
      const encodedPayload = btoa(JSON.stringify(fixedPayload))
        .replace(/=/g, '') // Remove padding equals
        .replace(/\+/g, '-') // Convert + to -
        .replace(/\//g, '_'); // Convert / to _
      
      // Combine to get the fixed token
      return `${header}.${encodedPayload}.${signature}`;
    }
    
    // If no fix needed, return the original token
    return token;
  } catch (error) {
    console.error('Error fixing token format:', error);
    return token; // Return original token if anything goes wrong
  }
};

/**
 * Check if a token is expired
 * @param token The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    // Get current time in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return payload.exp < now;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if there's an error
  }
};
