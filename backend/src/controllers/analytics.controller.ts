import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { asyncHandler } from '../middleware/errorHandler';

export class AnalyticsController {
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const stats = await AnalyticsService.getDashboardStats(userId, year);

    res.json({
      success: true,
      data: stats,
    });
  });

  static getMonthlyRevenue = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const data = await AnalyticsService.getMonthlyRevenue(userId, year);

    res.json({
      success: true,
      data,
    });
  });

  static getTopCustomers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const customers = await AnalyticsService.getTopCustomers(userId, limit);

    res.json({
      success: true,
      data: customers,
    });
  });

  static getStatusBreakdown = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const breakdown = await AnalyticsService.getInvoiceStatusBreakdown(userId);

    res.json({
      success: true,
      data: breakdown,
    });
  });

  static getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const activity = await AnalyticsService.getRecentActivity(userId, limit);

    res.json({
      success: true,
      data: activity,
    });
  });
}
