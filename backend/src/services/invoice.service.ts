import { Invoice, InvoiceStatus, DiscountType, Prisma } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
}

interface CreateInvoiceData {
  customerId: string;
  issueDate?: Date;
  dueDate?: Date;
  items: InvoiceItem[];
  taxRate?: number;
  taxName?: string;
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
  terms?: string;
  footer?: string;
  templateId?: string;
  status?: InvoiceStatus;
}

interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: InvoiceStatus;
}

export class InvoiceService {
  static async generateInvoiceNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Get the last invoice for this user this year
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        userId,
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let sequence = 1;

    if (lastInvoice) {
      const lastNumber = lastInvoice.invoiceNumber.split('-').pop();
      sequence = parseInt(lastNumber || '0', 10) + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  static calculateInvoiceTotals(
    items: InvoiceItem[],
    globalTaxRate: number = 0,
    discountType?: DiscountType,
    discountValue: number = 0
  ) {
    // Calculate subtotal
    let subtotal = 0;
    let itemTaxAmount = 0;

    items.forEach((item) => {
      const itemAmount = item.quantity * item.unitPrice;
      subtotal += itemAmount;

      // Calculate item-level tax if provided
      if (item.taxRate) {
        itemTaxAmount += (itemAmount * item.taxRate) / 100;
      }
    });

    // Calculate discount
    let discountAmount = 0;
    if (discountType && discountValue > 0) {
      if (discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * discountValue) / 100;
      } else {
        discountAmount = discountValue;
      }
    }

    // Calculate amount after discount
    const amountAfterDiscount = subtotal - discountAmount;

    // Calculate tax on discounted amount
    const taxAmount = itemTaxAmount > 0 ? itemTaxAmount : (amountAfterDiscount * globalTaxRate) / 100;

    // Calculate total
    const totalAmount = amountAfterDiscount + taxAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
    };
  }

  static async createInvoice(userId: string, data: CreateInvoiceData): Promise<Invoice> {
    // Get user's company
    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new AppError('Please set up your company profile first', 400);
    }

    // Verify customer belongs to user
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        userId,
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(userId);

    // Calculate totals
    const { subtotal, taxAmount, discountAmount, totalAmount } = this.calculateInvoiceTotals(
      data.items,
      data.taxRate || 0,
      data.discountType,
      data.discountValue || 0
    );

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId,
        companyId: company.id,
        customerId: data.customerId,
        status: data.status || 'DRAFT',
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        taxRate: data.taxRate,
        taxName: data.taxName,
        discountType: data.discountType,
        discountValue: data.discountValue,
        notes: data.notes,
        terms: data.terms,
        footer: data.footer,
        templateId: data.templateId,
        items: {
          create: data.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxRate
              ? (item.quantity * item.unitPrice * item.taxRate) / 100
              : undefined,
            discount: item.discount,
            order: index + 1,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
        company: true,
      },
    });

    return invoice;
  }

  static async getInvoices(
    userId: string,
    filters?: {
      status?: InvoiceStatus;
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      userId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.startDate && {
        issueDate: { gte: filters.startDate },
      }),
      ...(filters?.endDate && {
        issueDate: { lte: filters.endDate },
      }),
      ...(filters?.search && {
        OR: [
          { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
          { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          items: true,
          customer: true,
          company: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getInvoiceById(userId: string, invoiceId: string): Promise<Invoice> {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        customer: true,
        company: true,
        template: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice as Invoice;
  }

  static async updateInvoice(
    userId: string,
    invoiceId: string,
    data: UpdateInvoiceData
  ): Promise<Invoice> {
    // Verify invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: { items: true },
    });

    if (!existingInvoice) {
      throw new AppError('Invoice not found', 404);
    }

    // If items are being updated, recalculate totals
    let calculatedFields = {};

    if (data.items) {
      const { subtotal, taxAmount, discountAmount, totalAmount } = this.calculateInvoiceTotals(
        data.items,
        data.taxRate || existingInvoice.taxRate?.toNumber() || 0,
        data.discountType || existingInvoice.discountType || undefined,
        data.discountValue || existingInvoice.discountValue?.toNumber() || 0
      );

      calculatedFields = {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
      };

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId },
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.issueDate && { issueDate: data.issueDate }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
        ...(data.status && { status: data.status }),
        ...(data.taxRate !== undefined && { taxRate: data.taxRate }),
        ...(data.taxName !== undefined && { taxName: data.taxName }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.terms !== undefined && { terms: data.terms }),
        ...(data.footer !== undefined && { footer: data.footer }),
        ...(data.templateId !== undefined && { templateId: data.templateId }),
        ...calculatedFields,
        ...(data.items && {
          items: {
            create: data.items.map((item, index) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
              taxRate: item.taxRate,
              taxAmount: item.taxRate
                ? (item.quantity * item.unitPrice * item.taxRate) / 100
                : undefined,
              discount: item.discount,
              order: index + 1,
            })),
          },
        }),
      },
      include: {
        items: true,
        customer: true,
        company: true,
      },
    });

    return invoice;
  }

  static async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
  }

  static async duplicateInvoice(userId: string, invoiceId: string): Promise<Invoice> {
    const originalInvoice = await this.getInvoiceById(userId, invoiceId);

    const items = originalInvoice.items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity.toNumber(),
      unitPrice: item.unitPrice.toNumber(),
      taxRate: item.taxRate?.toNumber(),
      discount: item.discount?.toNumber(),
    }));

    const newInvoice = await this.createInvoice(userId, {
      customerId: originalInvoice.customerId,
      items,
      taxRate: originalInvoice.taxRate?.toNumber(),
      taxName: originalInvoice.taxName || undefined,
      discountType: originalInvoice.discountType || undefined,
      discountValue: originalInvoice.discountValue?.toNumber(),
      notes: originalInvoice.notes || undefined,
      terms: originalInvoice.terms || undefined,
      footer: originalInvoice.footer || undefined,
      templateId: originalInvoice.templateId || undefined,
      status: 'DRAFT',
    });

    return newInvoice;
  }
}
