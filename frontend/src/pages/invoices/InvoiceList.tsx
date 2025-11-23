import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { invoiceAPI } from '../../lib/api';
import { Plus, Search, Download, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['invoices', search, status],
    queryFn: async () => {
      const response = await invoiceAPI.getAll({ search, status });
      return response.data.data;
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceAPI.delete(id);
        toast.success('Invoice deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete invoice');
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
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link to="/invoices/new" className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
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
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input md:w-48"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        {data?.invoices && data.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((invoice: any) => (
                  <tr key={invoice.id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>{invoice.customer.name}</td>
                    <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td>
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="font-semibold">${invoice.totalAmount}</td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/invoices/${invoice.id}/edit`}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No invoices found</p>
            <Link to="/invoices/new" className="btn btn-primary">
              Create your first invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
