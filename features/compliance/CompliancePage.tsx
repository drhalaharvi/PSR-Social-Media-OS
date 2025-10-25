
import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const CompliancePage: React.FC = () => {
  const approvalRequests = [
    { title: "Post: 5 Tips for a Healthy Heart", status: "Approved", icon: CheckCircle2, color: "text-green-500" },
    { title: "Campaign: Summer Skincare Event", status: "Pending", icon: Clock, color: "text-yellow-500" },
    { title: "Video: Meet Our New Pediatrician", status: "Needs Revision", icon: XCircle, color: "text-red-500" },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Hub</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Manage approvals and ensure all content meets regulatory standards.</p>
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold p-6 text-gray-900 dark:text-white">Approval Queue</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {approvalRequests.map((req, index) => (
            <li key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <req.icon className={`w-6 h-6 mr-4 ${req.color}`} />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{req.title}</p>
                  <p className={`text-sm ${req.color}`}>{req.status}</p>
                </div>
              </div>
              <button className="text-sm font-semibold text-brand-primary hover:underline">View Details</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompliancePage;
