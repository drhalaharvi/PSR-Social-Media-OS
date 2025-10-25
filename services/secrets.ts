
export type AuthType = 'oauth' | 'apikey';

export interface Provider {
  id: string;
  name: string;
  authType: AuthType;
  connected: boolean;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    // OAuth tokens would be stored here in a real app
  };
  fields?: { name: string; label: string; type: string }[];
}

/**
 * SECURITY WARNING: This is a MOCK implementation for development only.
 *
 * PRODUCTION REQUIREMENTS:
 * 1. NEVER store credentials in browser memory or localStorage
 * 2. Use a secure backend service to store credentials
 * 3. Encrypt credentials at rest using industry-standard encryption (AES-256)
 * 4. Use environment variables for server-side API keys
 * 5. Implement proper OAuth 2.0 flows with secure token storage
 * 6. Use HttpOnly cookies for session tokens
 * 7. Implement proper CORS and CSRF protection
 * 8. Use a secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault)
 * 9. Rotate credentials regularly
 * 10. Never log or expose credentials in error messages
 *
 * This mock implementation is for UI/UX development only and should NOT be
 * deployed to production without a complete security overhaul.
 */

// In-memory store to simulate fetching and updating connection statuses
// WARNING: This stores credentials in plaintext in browser memory - DO NOT USE IN PRODUCTION!
export const connectionStore: Record<string, Provider> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram Graph API',
    authType: 'oauth',
    connected: false,
    credentials: {},
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook Pages',
    authType: 'oauth',
    connected: true, // Mock as pre-connected
    credentials: {},
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    authType: 'oauth',
    connected: false,
    credentials: {},
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    authType: 'apikey',
    connected: false,
    credentials: { apiKey: '', apiSecret: '' },
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'text' },
      { name: 'apiSecret', label: 'API Secret Key', type: 'password' },
    ],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    authType: 'oauth',
    connected: false,
    credentials: {},
  },
  google_business_profile: {
    id: 'google_business_profile',
    name: 'Google Business Profile',
    authType: 'oauth',
    connected: false,
    credentials: {},
  },
  wati: {
    id: 'wati',
    name: 'WATI (WhatsApp)',
    authType: 'apikey',
    connected: false,
    credentials: { apiKey: '', apiSecret: '' },
    fields: [
      { name: 'apiKey', label: 'API Endpoint', type: 'text' },
      { name: 'apiSecret', label: 'Access Token', type: 'password' },
    ],
  },
};

// Mock function to simulate fetching from a secure manager
export const getProviders = (): Provider[] => {
  return Object.values(connectionStore);
};
