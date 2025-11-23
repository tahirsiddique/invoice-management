import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, FileText, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const Analytics = () => {
  const { data: dashboard } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const response = await analyticsAPI.getDashboard();
      return response.data.data;
    },
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: async () => {
      const response = await analyticsAPI.getMonthlyRevenue();
      return response.data.data;
    },
  });

  const { data: topCustomers } = useQuery({
    queryKey: ['top-customers'],
    queryFn: async () => {
      const response = await analyticsAPI.getTopCustomers(5);
      return response.data.data;
    },
  });

  const { data: statusBreakdown } = useQuery({
    queryKey: ['status-breakdown'],
    queryFn: async () => {
      const response = await analyticsAPI.getStatusBreakdown();
      return response.data.data;
    },
  });

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${dashboard?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Total Invoices',
      value: dashboard?.totalInvoices || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Paid Revenue',
      value: `$${dashboard?.paidRevenue?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Revenue',
      value: `$${dashboard?.pendingRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="paid" fill="#10B981" name="Paid" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Status Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Invoice Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusBreakdown?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Top Customers by Revenue</h2>
        {topCustomers && topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Total Revenue</th>
                  <th>Invoices</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer: any) => (
                  <tr key={customer.id}>
                    <td className="font-medium">{customer.name}</td>
                    <td>{customer.company || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td className="font-semibold text-green-600">
                      ${customer.totalRevenue.toFixed(2)}
                    </td>
                    <td>{customer.invoiceCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
