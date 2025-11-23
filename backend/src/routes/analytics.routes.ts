import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/revenue/monthly', AnalyticsController.getMonthlyRevenue);
router.get('/customers/top', AnalyticsController.getTopCustomers);
router.get('/invoices/status', AnalyticsController.getStatusBreakdown);
router.get('/activity/recent', AnalyticsController.getRecentActivity);

export default router;
