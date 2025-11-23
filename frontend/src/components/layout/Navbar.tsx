import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {user?.firstName || user?.email}!
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
