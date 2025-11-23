import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  FileCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', to: '/invoices', icon: FileText },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-8 h-8 text-primary-400" />
          <span className="text-xl font-bold">IMS</span>
        </div>
      </div>

      <nav className="mt-6">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? 'bg-gray-800 text-white border-l-4 border-primary-500' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
