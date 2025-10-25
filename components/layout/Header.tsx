
import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import useHealthCheck from '../../hooks/useHealthCheck';

const Header: React.FC = () => {
  const { isHealthy, checking } = useHealthCheck();

  const HealthIndicator: React.FC = () => (
    <div className="flex items-center text-xs font-semibold mr-4">
      <span className="relative flex h-3 w-3">
        {isHealthy && !checking && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-status-green"></span>
          </>
        )}
        {!isHealthy && !checking && (
          <span className="relative inline-flex rounded-full h-3 w-3 bg-status-red"></span>
        )}
        {checking && (
           <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400 animate-pulse"></span>
        )}
      </span>
      <span className="ml-2 text-gray-600 dark:text-gray-300">
        {checking ? 'Checking...' : isHealthy ? 'API Healthy' : 'API Down'}
      </span>
    </div>
  );
  
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        {/* Mobile menu button can go here */}
      </div>

      <div className="flex items-center">
        <HealthIndicator />

        <button className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Search className="h-6 w-6" />
        </button>

        <button className="p-2 ml-4 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="h-6 w-6" />
        </button>

        <div className="ml-6 flex items-center">
          <span className="text-sm font-medium mr-2 text-gray-700 dark:text-gray-300">Dr. Ada Lovelace</span>
          <UserCircle className="h-8 w-8 text-brand-secondary" />
        </div>
      </div>
    </header>
  );
};

export default Header;
