
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
    <p className={`mt-2 flex items-center text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
      <ArrowUpRight className={`w-4 h-4 mr-1 ${changeType === 'decrease' ? 'transform rotate-180' : ''}`} />
      {change} vs. last month
    </p>
  </div>
);

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back, here's a summary of your social media performance.</p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Engagement" value="12,450" change="12.5%" changeType="increase" />
        <StatCard title="New Followers" value="832" change="5.2%" changeType="increase" />
        <StatCard title="Posts Published" value="28" change="2.1%" changeType="decrease" />
        <StatCard title="Compliance Score" value="98%" change="0.5%" changeType="increase" />
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Over Time</h2>
        <div className="mt-4 h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart will be rendered here.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
