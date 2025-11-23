import { Customer, Prisma } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  notes?: string;
}

export class CustomerService {
  static async createCustomer(userId: string, data: CreateCustomerData): Promise<Customer> {
    // Check if customer with same email already exists for this user
    if (data.email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          userId,
          email: data.email,
        },
      });

      if (existingCustomer) {
        throw new AppError('Customer with this email already exists', 400);
      }
    }

    const customer = await prisma.customer.create({
      data: {
        userId,
        ...data,
      },
    });

    return customer;
  }

  static async getCustomers(
    userId: string,
    filters?: {
      search?: string;
      isActive?: boolean;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      userId,
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(userId: string, customerId: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId,
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer as Customer;
  }

  static async updateCustomer(
    userId: string,
    customerId: string,
    data: Partial<CreateCustomerData>
  ): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data,
    });

    return updated;
  }

  static async deleteCustomer(userId: string, customerId: string): Promise<void> {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Check if customer has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { customerId },
    });

    if (invoiceCount > 0) {
      throw new AppError(
        'Cannot delete customer with existing invoices. Deactivate instead.',
        400
      );
    }

    await prisma.customer.delete({
      where: { id: customerId },
    });
  }

  static async toggleCustomerStatus(userId: string, customerId: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: { isActive: !customer.isActive },
    });

    return updated;
  }
}
