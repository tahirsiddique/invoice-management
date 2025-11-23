import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../middleware/upload';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/db';

const router = Router();

router.use(authenticate);

// Get current user profile
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const user = req.user!;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  })
);

// Update profile
router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { firstName, lastName } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  })
);

// Upload avatar
router.post(
  '/avatar',
  upload.single('avatar'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl, user },
    });
  })
);

// Admin: Get all users
router.get(
  '/',
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: { users },
    });
  })
);

export default router;
