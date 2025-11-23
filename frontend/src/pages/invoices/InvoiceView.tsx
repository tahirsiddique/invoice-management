import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invoiceAPI, exportAPI } from '../../lib/api';
import {
  ArrowLeft,
  Download,
  Mail,
  Edit,
  FileText,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await invoiceAPI.getById(id!);
      return response.data.data.invoice;
    },
    enabled: !!id,
  });

  const handleExportPDF = async () => {
    try {
      const response = await exportAPI.pdf(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceData.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await exportAPI.excel(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceData.invoiceNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Excel file');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!invoiceData) {
    return <div>Invoice not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </button>

        <div className="flex items-center space-x-2">
          <button onClick={handlePrint} className="btn btn-secondary flex items-center">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button onClick={handleExportPDF} className="btn btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button onClick={handleExportExcel} className="btn btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
          <Link to={`/invoices/${id}/edit`} className="btn btn-primary flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="card max-w-4xl mx-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
            </div>
            <div className="text-right">
              {invoiceData.company && (
                <div>
                  <h2 className="text-xl font-bold">{invoiceData.company.name}</h2>
                  {invoiceData.company.address && (
                    <p className="text-sm text-gray-600">{invoiceData.company.address}</p>
                  )}
                  {invoiceData.company.city && (
                    <p className="text-sm text-gray-600">
                      {invoiceData.company.city}, {invoiceData.company.state}{' '}
                      {invoiceData.company.zipCode}
                    </p>
                  )}
                  {invoiceData.company.email && (
                    <p className="text-sm text-gray-600">{invoiceData.company.email}</p>
                  )}
                  {invoiceData.company.phone && (
                    <p className="text-sm text-gray-600">{invoiceData.company.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
              <p className="font-medium">{invoiceData.customer.name}</p>
              {invoiceData.customer.company && (
                <p className="text-sm text-gray-600">{invoiceData.customer.company}</p>
              )}
              {invoiceData.customer.address && (
                <p className="text-sm text-gray-600">{invoiceData.customer.address}</p>
              )}
              {invoiceData.customer.email && (
                <p className="text-sm text-gray-600">{invoiceData.customer.email}</p>
              )}
            </div>
            <div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">
                    {new Date(invoiceData.issueDate).toLocaleDateString()}
                  </span>
                </div>
                {invoiceData.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">
                      {new Date(invoiceData.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      invoiceData.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : invoiceData.status === 'SENT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {invoiceData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoiceData.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    ${parseFloat(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    ${parseFloat(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${parseFloat(invoiceData.subtotal).toFixed(2)}</span>
              </div>
              {parseFloat(invoiceData.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">
                    -${parseFloat(invoiceData.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              {parseFloat(invoiceData.taxAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax {invoiceData.taxRate && `(${invoiceData.taxRate}%)`}:
                  </span>
                  <span className="font-medium">${parseFloat(invoiceData.taxAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${parseFloat(invoiceData.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoiceData.notes || invoiceData.terms) && (
            <div className="space-y-4 border-t pt-6">
              {invoiceData.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Notes:</h3>
                  <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                </div>
              )}
              {invoiceData.terms && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Terms & Conditions:</h3>
                  <p className="text-sm text-gray-600">{invoiceData.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
