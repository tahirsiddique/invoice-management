import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { customerAPI, invoiceAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const InvoiceEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: invoiceData, isLoading: loadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await invoiceAPI.getById(id!);
      return response.data.data.invoice;
    },
    enabled: !!id,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerAPI.getAll();
      return response.data.data;
    },
  });

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      customerId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      discountType: 'PERCENTAGE' as const,
      discountValue: 0,
      notes: '',
      terms: '',
      status: 'DRAFT' as const,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (invoiceData) {
      reset({
        customerId: invoiceData.customerId,
        items: invoiceData.items.map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
        taxRate: parseFloat(invoiceData.taxRate || 0),
        discountType: invoiceData.discountType || 'PERCENTAGE',
        discountValue: parseFloat(invoiceData.discountValue || 0),
        notes: invoiceData.notes || '',
        terms: invoiceData.terms || '',
        status: invoiceData.status,
      });
    }
  }, [invoiceData, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await invoiceAPI.update(id!, data);
      toast.success('Invoice updated successfully');
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to update invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInvoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/invoices')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Invoices
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Invoice</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <select {...register('customerId', { required: true })} className="input">
                <option value="">Select Customer</option>
                {customersData?.customers?.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Items</h2>
                <button
                  type="button"
                  onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                  className="btn btn-secondary flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`items.${index}.description` as const)}
                      placeholder="Description"
                      className="input flex-1"
                    />
                    <input
                      {...register(`items.${index}.quantity` as const, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      placeholder="Qty"
                      className="input w-20"
                    />
                    <input
                      {...register(`items.${index}.unitPrice` as const, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      className="input w-28"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea {...register('notes')} className="input" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea {...register('terms')} className="input" rows={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <select {...register('status')} className="input">
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Tax & Discount */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Tax & Discount</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    {...register('taxRate', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select {...register('discountType')} className="input">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value
                  </label>
                  <input
                    {...register('discountValue', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? 'Updating...' : 'Update Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/invoices')}
                  className="btn btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceEdit;
