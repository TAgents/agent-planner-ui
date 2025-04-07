/**
 * Helper functions for working with JWT tokens
 */

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
