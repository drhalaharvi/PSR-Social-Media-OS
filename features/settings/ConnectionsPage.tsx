
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Provider } from '../../services/secrets';
import { Link, CheckCircle, XCircle, Key, LogIn } from 'lucide-react';

const ConnectionsPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      const data = await api.getProviders();
      setProviders(data);
      // Initialize credentials state
      const initialCreds: Record<string, Record<string, string>> = {};
      data.forEach(p => {
        if (p.authType === 'apikey' && p.fields) {
          initialCreds[p.id] = {};
          p.fields.forEach(field => {
            initialCreds[p.id][field.name] = p.credentials[field.name as keyof typeof p.credentials] || '';
          });
        }
      });
      setCredentials(initialCreds);
      setLoading(false);
    };
    fetchProviders();
  }, []);

  const handleCredentialChange = (providerId: string, fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldName]: value,
      },
    }));
  };

  const handleApiKeySave = async (providerId: string) => {
    const creds = credentials[providerId];
    await api.updateApiKeyConnection(providerId, creds.apiKey, creds.apiSecret);
    const updatedProviders = await api.getProviders();
    setProviders(updatedProviders);
    alert(`${providerId} connection updated!`);
  };

  const handleOAuthToggle = async (providerId: string, connect: boolean) => {
    await api.toggleOAuthConnection(providerId, connect);
    const updatedProviders = await api.getProviders();
    setProviders(updatedProviders);
  };

  const ProviderCard: React.FC<{ provider: Provider }> = ({ provider }) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
            <div className={`mt-1 flex items-center text-sm font-semibold ${provider.connected ? 'text-status-green' : 'text-gray-500'}`}>
              {provider.connected ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <XCircle className="w-4 h-4 mr-1.5" />}
              {provider.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          {provider.authType === 'oauth' 
             ? <LogIn className="w-6 h-6 text-gray-400" /> 
             : <Key className="w-6 h-6 text-gray-400" />}
        </div>

        <div className="mt-6">
          {provider.authType === 'oauth' && (
            <button
              onClick={() => handleOAuthToggle(provider.id, !provider.connected)}
              className={`w-full flex items-center justify-center font-bold py-2 px-4 rounded-lg transition-colors ${
                provider.connected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900'
                  : 'bg-brand-primary text-white hover:bg-brand-secondary'
              }`}
            >
              <Link className="w-5 h-5 mr-2" />
              {provider.connected ? 'Disconnect' : 'Connect via OAuth'}
            </button>
          )}

          {provider.authType === 'apikey' && provider.fields && (
            <div className="space-y-4">
              {provider.fields.map(field => (
                <div key={field.name}>
                  <label htmlFor={`${provider.id}-${field.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                  <input
                    type={field.type}
                    id={`${provider.id}-${field.name}`}
                    value={credentials[provider.id]?.[field.name] || ''}
                    onChange={(e) => handleCredentialChange(provider.id, field.name, e.target.value)}
                    className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
              ))}
              <button
                onClick={() => handleApiKeySave(provider.id)}
                className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary"
              >
                Save & Connect
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Manage connections to your social media accounts.</p>
      {loading ? (
        <p className="mt-8">Loading providers...</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;
