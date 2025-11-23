import { Request, Response } from 'express';
import { DriveService } from '../services/drive.service';
import { asyncHandler } from '../middleware/errorHandler';

export class DriveController {
  static uploadInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { accessToken } = req.body;

    const fileId = await DriveService.uploadInvoice(userId, id, accessToken);

    res.json({
      success: true,
      message: 'Invoice uploaded to Google Drive',
      data: { fileId },
    });
  });

  static listInvoices = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken } = req.body;

    const files = await DriveService.listInvoices(accessToken);

    res.json({
      success: true,
      data: { files },
    });
  });

  static syncAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { accessToken } = req.body;

    const results = await DriveService.syncAllInvoices(userId, accessToken);

    res.json({
      success: true,
      message: 'Sync completed',
      data: results,
    });
  });
}
