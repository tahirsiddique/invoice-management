import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../middleware/upload';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Get company
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const company = await prisma.company.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: { company },
    });
  })
);

// Create/Update company
router.post(
  '/',
  [body('name').notEmpty().withMessage('Company name is required')],
  validate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = req.body;

    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });

    let company;

    if (existingCompany) {
      company = await prisma.company.update({
        where: { userId },
        data,
      });
    } else {
      company = await prisma.company.create({
        data: {
          userId,
          ...data,
        },
      });
    }

    res.json({
      success: true,
      message: existingCompany ? 'Company updated' : 'Company created',
      data: { company },
    });
  })
);

// Upload logo
router.post(
  '/logo',
  upload.single('logo'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    const company = await prisma.company.update({
      where: { userId },
      data: { logo: logoUrl },
    });

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl, company },
    });
  })
);

export default router;
