import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { asyncHandler } from './errorHandler';

export const auditLog = (action: string, entity: string) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Store original methods
      const originalJson = res.json.bind(res);

      // Override json method to capture response
      res.json = function (body: any) {
        // Create audit log after successful response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          prisma.auditLog
            .create({
              data: {
                userId: req.user?.id,
                action,
                entity,
                entityId: body?.data?.id || req.params.id,
                details: JSON.stringify({
                  method: req.method,
                  url: req.originalUrl,
                  body: req.body,
                }),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
              },
            })
            .catch((error) => {
              console.error('Audit log failed:', error);
            });
        }

        return originalJson(body);
      };

      next();
    }
  );
};
