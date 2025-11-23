import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/db';

const router = Router();

router.use(authenticate);

// Get all templates
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const templates = await prisma.invoiceTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { templates },
    });
  })
);

// Get template by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const template = await prisma.invoiceTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    res.json({
      success: true,
      data: { template },
    });
  })
);

// Create template
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = req.body;

    const template = await prisma.invoiceTemplate.create({
      data: {
        userId,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: { template },
    });
  })
);

// Update template
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.invoiceTemplate.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Template not found', 404);
    }

    const template = await prisma.invoiceTemplate.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: { template },
    });
  })
);

// Delete template
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const template = await prisma.invoiceTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    await prisma.invoiceTemplate.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  })
);

export default router;
