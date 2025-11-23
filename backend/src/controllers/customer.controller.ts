import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { asyncHandler } from '../middleware/errorHandler';

export class CustomerController {
  static createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body;

    const customer = await CustomerService.createCustomer(userId, data);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer },
    });
  });

  static getCustomers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { search, isActive, page, limit } = req.query;

    const filters = {
      ...(search && { search: search as string }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const result = await CustomerService.getCustomers(userId, filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  });

  static getCustomerById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const customer = await CustomerService.getCustomerById(userId, id);

    res.json({
      success: true,
      data: { customer },
    });
  });

  static updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body;

    const customer = await CustomerService.updateCustomer(userId, id, data);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer },
    });
  });

  static deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await CustomerService.deleteCustomer(userId, id);

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  });

  static toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const customer = await CustomerService.toggleCustomerStatus(userId, id);

    res.json({
      success: true,
      message: 'Customer status updated',
      data: { customer },
    });
  });
}
