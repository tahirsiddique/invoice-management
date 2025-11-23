import { google } from 'googleapis';
import { AppError } from '../middleware/errorHandler';
import { InvoiceService } from './invoice.service';
import { ExportService } from './export.service';
import prisma from '../config/db';

export class DriveService {
  private static getAuthClient(accessToken: string) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({ access_token: accessToken });
    return auth;
  }

  static async uploadInvoice(
    userId: string,
    invoiceId: string,
    accessToken: string
  ): Promise<string> {
    try {
      const auth = this.getAuthClient(accessToken);
      const drive = google.drive({ version: 'v3', auth });

      // Get invoice
      const invoice = await InvoiceService.getInvoiceById(userId, invoiceId) as any;

      // Generate PDF
      const pdfBuffer = await ExportService.generatePDF(userId, invoiceId);

      // Upload to Drive
      const response = await drive.files.create({
        requestBody: {
          name: `Invoice-${invoice.invoiceNumber}.pdf`,
          mimeType: 'application/pdf',
        },
        media: {
          mimeType: 'application/pdf',
          body: Buffer.from(pdfBuffer),
        },
        fields: 'id',
      });

      const fileId = response.data.id;

      if (!fileId) {
        throw new AppError('Failed to upload file to Google Drive', 500);
      }

      // Update invoice with Drive file ID
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          driveFileId: fileId,
          lastSyncedAt: new Date(),
        },
      });

      return fileId;
    } catch (error: any) {
      throw new AppError(
        `Google Drive upload failed: ${error.message}`,
        500
      );
    }
  }

  static async listInvoices(accessToken: string) {
    try {
      const auth = this.getAuthClient(accessToken);
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.list({
        q: "mimeType='application/pdf' and name contains 'Invoice'",
        fields: 'files(id, name, createdTime, modifiedTime, size)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      });

      return response.data.files || [];
    } catch (error: any) {
      throw new AppError(
        `Failed to list Google Drive files: ${error.message}`,
        500
      );
    }
  }

  static async downloadInvoice(fileId: string, accessToken: string): Promise<Buffer> {
    try {
      const auth = this.getAuthClient(accessToken);
      const drive = google.drive({ version: 'v3', auth });

      const response = await drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error: any) {
      throw new AppError(
        `Failed to download from Google Drive: ${error.message}`,
        500
      );
    }
  }

  static async deleteInvoice(fileId: string, accessToken: string): Promise<void> {
    try {
      const auth = this.getAuthClient(accessToken);
      const drive = google.drive({ version: 'v3', auth });

      await drive.files.delete({ fileId });
    } catch (error: any) {
      throw new AppError(
        `Failed to delete from Google Drive: ${error.message}`,
        500
      );
    }
  }

  static async syncAllInvoices(userId: string, accessToken: string) {
    const { invoices } = await InvoiceService.getInvoices(
      userId,
      { status: 'SENT' },
      { limit: 1000 }
    );

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const invoice of invoices) {
      try {
        if (!invoice.driveFileId) {
          await this.uploadInvoice(userId, invoice.id, accessToken);
          results.success++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${invoice.invoiceNumber}: ${error.message}`);
      }
    }

    return results;
  }
}
