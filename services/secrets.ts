
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

// In-memory store to simulate fetching and updating connection statuses
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
