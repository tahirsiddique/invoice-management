import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/db';

const router = Router();

router.use(authenticate);

// Get all themes
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const themes = await prisma.theme.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { themes },
    });
  })
);

// Get active theme
router.get(
  '/active',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const theme = await prisma.theme.findFirst({
      where: { userId, isActive: true },
    });

    res.json({
      success: true,
      data: { theme },
    });
  })
);

// Create theme
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = req.body;

    const theme = await prisma.theme.create({
      data: {
        userId,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Theme created successfully',
      data: { theme },
    });
  })
);

// Update theme
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.theme.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Theme not found', 404);
    }

    const theme = await prisma.theme.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: { theme },
    });
  })
);

// Set active theme
router.post(
  '/:id/activate',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const theme = await prisma.theme.findFirst({
      where: { id, userId },
    });

    if (!theme) {
      throw new AppError('Theme not found', 404);
    }

    // Deactivate all themes
    await prisma.theme.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Activate selected theme
    const updated = await prisma.theme.update({
      where: { id },
      data: { isActive: true },
    });

    res.json({
      success: true,
      message: 'Theme activated',
      data: { theme: updated },
    });
  })
);

// Delete theme
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const theme = await prisma.theme.findFirst({
      where: { id, userId },
    });

    if (!theme) {
      throw new AppError('Theme not found', 404);
    }

    await prisma.theme.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Theme deleted successfully',
    });
  })
);

export default router;
