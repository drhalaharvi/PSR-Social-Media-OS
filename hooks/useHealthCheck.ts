
import { useState, useEffect } from 'react';
import { api } from '../services/api';

const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkApiHealth = async () => {
      setChecking(true);
      try {
        const response = await api.healthCheck();
        setIsHealthy(response.ok);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setChecking(false);
      }
    };

    // Check health on mount and then every 30 seconds
    checkApiHealth();
    const intervalId = setInterval(checkApiHealth, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return { isHealthy, checking };
};

export default useHealthCheck;
