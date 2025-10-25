import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Inbox, PenSquare, BarChart2, ShieldCheck, Bot, BrainCircuit, Settings, Telescope } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Planner', path: '/planner', icon: Calendar },
  { name: 'Inbox', path: '/inbox', icon: Inbox },
  { name: 'Content Studio', path: '/content-studio', icon: PenSquare },
  { name: 'Analytics & Experiments', path: '/analytics', icon: BarChart2 },
  { name: 'Competitors', path: '/competitor-analysis', icon: Telescope },
  { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { name: 'Brand RAG', path: '/brand-rag', icon: BrainCircuit },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const NavItem: React.FC<{ name: string; path: string; icon: React.ElementType }> = ({ name, path, icon: Icon }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-brand-primary text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-700'
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="truncate">{name}</span>
    </NavLink>
  );

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <Bot className="h-8 w-8 text-brand-primary" />
        <h1 className="ml-2 text-xl font-bold text-gray-800 dark:text-white">AI Social OS</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => <NavItem key={item.name} {...item} />)}
      </nav>
    </div>
  );
};

export default Sidebar;