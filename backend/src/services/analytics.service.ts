import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  static async getDashboardStats(userId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      paidRevenue,
      customerCount,
      recentInvoices,
    ] = await Promise.all([
      // Total invoices
      prisma.invoice.count({
        where: {
          userId,
          issueDate: { gte: startDate, lte: endDate },
        },
      }),

      // Paid invoices
      prisma.invoice.count({
        where: {
          userId,
          status: 'PAID',
          issueDate: { gte: startDate, lte: endDate },
        },
      }),

      // Pending invoices
      prisma.invoice.count({
        where: {
          userId,
          status: 'SENT',
          issueDate: { gte: startDate, lte: endDate },
        },
      }),

      // Overdue invoices
      prisma.invoice.count({
        where: {
          userId,
          status: 'OVERDUE',
          issueDate: { gte: startDate, lte: endDate },
        },
      }),

      // Total revenue (all invoices)
      prisma.invoice.aggregate({
        where: {
          userId,
          issueDate: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      }),

      // Paid revenue
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          issueDate: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      }),

      // Customer count
      prisma.customer.count({
        where: { userId, isActive: true },
      }),

      // Recent invoices
      prisma.invoice.findMany({
        where: { userId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      paidRevenue: paidRevenue._sum.totalAmount || 0,
      pendingRevenue:
        (totalRevenue._sum.totalAmount || 0) - (paidRevenue._sum.totalAmount || 0),
      customerCount,
      recentInvoices,
    };
  }

  static async getMonthlyRevenue(userId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        issueDate: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
      select: {
        issueDate: true,
        totalAmount: true,
        status: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(currentYear, i).toLocaleString('default', {
        month: 'short',
      }),
      total: 0,
      paid: 0,
      pending: 0,
    }));

    invoices.forEach((invoice) => {
      const month = new Date(invoice.issueDate).getMonth();
      const amount = Number(invoice.totalAmount);

      monthlyData[month].total += amount;

      if (invoice.status === 'PAID') {
        monthlyData[month].paid += amount;
      } else {
        monthlyData[month].pending += amount;
      }
    });

    return monthlyData;
  }

  static async getTopCustomers(userId: string, limit: number = 10) {
    const customers = await prisma.customer.findMany({
      where: { userId },
      include: {
        invoices: {
          where: { status: 'PAID' },
          select: { totalAmount: true },
        },
      },
    });

    const customersWithRevenue = customers
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        company: customer.company,
        email: customer.email,
        totalRevenue: customer.invoices.reduce(
          (sum, inv) => sum + Number(inv.totalAmount),
          0
        ),
        invoiceCount: customer.invoices.length,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return customersWithRevenue;
  }

  static async getInvoiceStatusBreakdown(userId: string) {
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
      _sum: { totalAmount: true },
    });

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
      totalAmount: item._sum.totalAmount || 0,
    }));
  }

  static async getRecentActivity(userId: string, limit: number = 20) {
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return auditLogs;
  }
}
