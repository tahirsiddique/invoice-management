import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendInvoiceEmail } from '../utils/email';

export class ExportController {
  static exportPDF = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const pdfBuffer = await ExportService.generatePDF(userId, id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    res.send(pdfBuffer);
  });

  static exportExcel = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const excelBuffer = await ExportService.generateExcel(userId, id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.xlsx`);
    res.send(excelBuffer);
  });

  static exportWord = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const wordBuffer = await ExportService.generateWord(userId, id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.docx`);
    res.send(wordBuffer);
  });

  static emailInvoice = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { email, invoiceNumber } = req.body;

    const pdfBuffer = await ExportService.generatePDF(userId, id);
    const success = await sendInvoiceEmail(email, invoiceNumber, pdfBuffer);

    if (!success) {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Invoice sent successfully',
    });
  });
}
