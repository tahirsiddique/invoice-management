import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../lib/api';
import { DollarSign, FileText, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await analyticsAPI.getDashboard();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${dashboardData?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Total Invoices',
      value: dashboardData?.totalInvoices || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Customers',
      value: dashboardData?.customerCount || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Paid Invoices',
      value: dashboardData?.paidInvoices || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
        {dashboardData?.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentInvoices.map((invoice: any) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.customer.name}</td>
                    <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td>${invoice.totalAmount}</td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No invoices yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
