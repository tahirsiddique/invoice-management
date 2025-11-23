import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/db';

const router = Router();

router.use(authenticate);

// Get audit logs (admin or own logs)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    const { page, limit, entity, action } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = isAdmin ? {} : { userId };

    if (entity) {
      where.entity = entity;
    }

    if (action) {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  })
);

export default router;
