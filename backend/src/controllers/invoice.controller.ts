import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { asyncHandler } from '../middleware/errorHandler';
import { InvoiceStatus, DiscountType } from '@prisma/client';

export class InvoiceController {
  static createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body;

    const invoice = await InvoiceService.createInvoice(userId, data);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice },
    });
  });

  static getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      status,
      customerId,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;

    const filters = {
      ...(status && { status: status as InvoiceStatus }),
      ...(customerId && { customerId: customerId as string }),
      ...(startDate && { startDate: new Date(startDate as string) }),
      ...(endDate && { endDate: new Date(endDate as string) }),
      ...(search && { search: search as string }),
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const result = await InvoiceService.getInvoices(userId, filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  });

  static getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const invoice = await InvoiceService.getInvoiceById(userId, id);

    res.json({
      success: true,
      data: { invoice },
    });
  });

  static updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body;

    const invoice = await InvoiceService.updateInvoice(userId, id, data);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice },
    });
  });

  static deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await InvoiceService.deleteInvoice(userId, id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  });

  static duplicateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const invoice = await InvoiceService.duplicateInvoice(userId, id);

    res.status(201).json({
      success: true,
      message: 'Invoice duplicated successfully',
      data: { invoice },
    });
  });
}
