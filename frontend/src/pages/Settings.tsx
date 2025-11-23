import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { companyAPI, authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Building2, User, Lock, Save } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security'>('profile');

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  // Company form
  const { data: companyData } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const response = await companyAPI.get();
      return response.data.data.company;
    },
  });

  const {
    register: registerCompany,
    handleSubmit: handleCompanySubmit,
    formState: { errors: companyErrors },
  } = useForm({
    values: companyData || {},
  });

  // Security form
  const {
    register: registerSecurity,
    handleSubmit: handleSecuritySubmit,
    reset: resetSecurity,
    formState: { errors: securityErrors },
  } = useForm();

  const onProfileSubmit = async (data: any) => {
    try {
      // Update profile logic here
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const onCompanySubmit = async (data: any) => {
    try {
      await companyAPI.update(data);
      toast.success('Company information updated successfully');
    } catch (error) {
      toast.error('Failed to update company information');
    }
  };

  const onSecuritySubmit = async (data: any) => {
    try {
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      resetSecurity();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: User },
    { id: 'company' as const, name: 'Company', icon: Building2 },
    { id: 'security' as const, name: 'Security', icon: Lock },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="card lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input {...registerProfile('firstName')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input {...registerProfile('lastName')} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    value={user?.email}
                    disabled
                    className="input bg-gray-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>
                <button type="submit" className="btn btn-primary flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <form onSubmit={handleCompanySubmit(onCompanySubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input {...registerCompany('name')} className="input" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input {...registerCompany('email')} type="email" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input {...registerCompany('phone')} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input {...registerCompany('address')} className="input" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input {...registerCompany('city')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input {...registerCompany('state')} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input {...registerCompany('zipCode')} className="input" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              <form onSubmit={handleSecuritySubmit(onSecuritySubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    {...registerSecurity('currentPassword', { required: true })}
                    type="password"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    {...registerSecurity('newPassword', {
                      required: true,
                      minLength: 8,
                    })}
                    type="password"
                    className="input"
                  />
                  {securityErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      Password must be at least 8 characters
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    {...registerSecurity('confirmPassword', { required: true })}
                    type="password"
                    className="input"
                  />
                </div>
                <button type="submit" className="btn btn-primary flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
