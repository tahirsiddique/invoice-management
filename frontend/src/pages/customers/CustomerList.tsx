import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customerAPI } from '../../lib/api';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', search, isActive],
    queryFn: async () => {
      const response = await customerAPI.getAll({ search, isActive });
      return response.data.data;
    },
  });

  const handleToggleStatus = async (id: string) => {
    try {
      await customerAPI.toggleStatus(id);
      toast.success('Customer status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update customer status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        toast.success('Customer deleted successfully');
        refetch();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <Link to="/customers/new" className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={isActive === undefined ? '' : isActive ? 'true' : 'false'}
            onChange={(e) =>
              setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="input md:w-48"
          >
            <option value="">All Customers</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        {data?.customers && data.customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((customer: any) => (
                  <tr key={customer.id}>
                    <td className="font-medium">{customer.name}</td>
                    <td>{customer.company || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          customer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/customers/${customer.id}/edit`}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(customer.id)}
                          className="p-1 text-orange-600 hover:text-orange-800"
                          title={customer.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {customer.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No customers found</p>
            <Link to="/customers/new" className="btn btn-primary">
              Create your first customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
