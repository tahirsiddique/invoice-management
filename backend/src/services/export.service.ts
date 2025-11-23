import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import * as XLSX from 'xlsx';
import { Invoice } from '@prisma/client';
import { InvoiceService } from './invoice.service';
import { AppError } from '../middleware/errorHandler';

export class ExportService {
  static async generatePDF(userId: string, invoiceId: string): Promise<Buffer> {
    const invoice = await InvoiceService.getInvoiceById(userId, invoiceId) as any;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(24).text('INVOICE', { align: 'center' });
      doc.moveDown();

      // Company info
      if (invoice.company) {
        doc.fontSize(12).font('Helvetica-Bold').text(invoice.company.name);
        doc.fontSize(10).font('Helvetica');
        if (invoice.company.address) doc.text(invoice.company.address);
        if (invoice.company.city) doc.text(`${invoice.company.city}, ${invoice.company.state} ${invoice.company.zipCode}`);
        if (invoice.company.email) doc.text(invoice.company.email);
        if (invoice.company.phone) doc.text(invoice.company.phone);
      }

      doc.moveDown();

      // Invoice details
      doc.fontSize(10).font('Helvetica-Bold').text(`Invoice Number: `, { continued: true })
        .font('Helvetica').text(invoice.invoiceNumber);
      doc.font('Helvetica-Bold').text(`Issue Date: `, { continued: true })
        .font('Helvetica').text(new Date(invoice.issueDate).toLocaleDateString());
      if (invoice.dueDate) {
        doc.font('Helvetica-Bold').text(`Due Date: `, { continued: true })
          .font('Helvetica').text(new Date(invoice.dueDate).toLocaleDateString());
      }
      doc.font('Helvetica-Bold').text(`Status: `, { continued: true })
        .font('Helvetica').text(invoice.status);

      doc.moveDown();

      // Customer info
      doc.fontSize(10).font('Helvetica-Bold').text('BILL TO:');
      doc.font('Helvetica').text(invoice.customer.name);
      if (invoice.customer.company) doc.text(invoice.customer.company);
      if (invoice.customer.address) doc.text(invoice.customer.address);
      if (invoice.customer.city) doc.text(`${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.zipCode}`);
      if (invoice.customer.email) doc.text(invoice.customer.email);

      doc.moveDown();

      // Items table header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qty', 300, tableTop, { width: 50, align: 'right' });
      doc.text('Price', 360, tableTop, { width: 70, align: 'right' });
      doc.text('Amount', 440, tableTop, { width: 100, align: 'right' });

      // Draw line
      doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

      // Items
      let yPosition = tableTop + 25;
      doc.font('Helvetica');

      invoice.items.forEach((item: any) => {
        doc.text(item.description, 50, yPosition, { width: 240 });
        doc.text(item.quantity.toString(), 300, yPosition, { width: 50, align: 'right' });
        doc.text(`$${item.unitPrice.toFixed(2)}`, 360, yPosition, { width: 70, align: 'right' });
        doc.text(`$${item.amount.toFixed(2)}`, 440, yPosition, { width: 100, align: 'right' });
        yPosition += 25;
      });

      // Draw line
      doc.moveTo(50, yPosition).lineTo(540, yPosition).stroke();
      yPosition += 10;

      // Totals
      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 390, yPosition);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, 440, yPosition, { width: 100, align: 'right' });
      yPosition += 20;

      if (invoice.discountAmount > 0) {
        doc.text('Discount:', 390, yPosition);
        doc.text(`-$${invoice.discountAmount.toFixed(2)}`, 440, yPosition, { width: 100, align: 'right' });
        yPosition += 20;
      }

      if (invoice.taxAmount > 0) {
        const taxLabel = invoice.taxName ? `${invoice.taxName} (${invoice.taxRate}%):` : 'Tax:';
        doc.text(taxLabel, 390, yPosition);
        doc.text(`$${invoice.taxAmount.toFixed(2)}`, 440, yPosition, { width: 100, align: 'right' });
        yPosition += 20;
      }

      // Total
      doc.fontSize(12);
      doc.text('TOTAL:', 390, yPosition);
      doc.text(`$${invoice.totalAmount.toFixed(2)}`, 440, yPosition, { width: 100, align: 'right' });

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Bold').text('Notes:');
        doc.font('Helvetica').text(invoice.notes);
      }

      // Terms
      if (invoice.terms) {
        doc.moveDown();
        doc.fontSize(10).font('Helvetica-Bold').text('Terms & Conditions:');
        doc.font('Helvetica').text(invoice.terms);
      }

      // Footer
      if (invoice.footer) {
        doc.moveDown();
        doc.fontSize(8).text(invoice.footer, { align: 'center' });
      }

      doc.end();
    });
  }

  static async generateExcel(userId: string, invoiceId: string): Promise<Buffer> {
    const invoice = await InvoiceService.getInvoiceById(userId, invoiceId) as any;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Invoice details
    const invoiceData = [
      ['INVOICE'],
      [],
      ['Invoice Number:', invoice.invoiceNumber],
      ['Issue Date:', new Date(invoice.issueDate).toLocaleDateString()],
      ['Due Date:', invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'],
      ['Status:', invoice.status],
      [],
      ['COMPANY INFORMATION'],
      ['Name:', invoice.company?.name || ''],
      ['Address:', invoice.company?.address || ''],
      ['City:', invoice.company?.city || ''],
      ['Email:', invoice.company?.email || ''],
      ['Phone:', invoice.company?.phone || ''],
      [],
      ['CUSTOMER INFORMATION'],
      ['Name:', invoice.customer.name],
      ['Company:', invoice.customer.company || ''],
      ['Email:', invoice.customer.email || ''],
      ['Address:', invoice.customer.address || ''],
      [],
      ['ITEMS'],
      ['Description', 'Quantity', 'Unit Price', 'Amount'],
    ];

    // Add items
    invoice.items.forEach((item: any) => {
      invoiceData.push([
        item.description,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.amount.toFixed(2)}`,
      ]);
    });

    // Add totals
    invoiceData.push(
      [],
      ['Subtotal:', '', '', `$${invoice.subtotal.toFixed(2)}`],
      ['Discount:', '', '', `-$${invoice.discountAmount.toFixed(2)}`],
      ['Tax:', '', '', `$${invoice.taxAmount.toFixed(2)}`],
      ['TOTAL:', '', '', `$${invoice.totalAmount.toFixed(2)}`]
    );

    if (invoice.notes) {
      invoiceData.push([], ['Notes:', invoice.notes]);
    }

    if (invoice.terms) {
      invoiceData.push([], ['Terms:', invoice.terms]);
    }

    const ws = XLSX.utils.aoa_to_sheet(invoiceData);

    // Set column widths
    ws['!cols'] = [
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  static async generateWord(userId: string, invoiceId: string): Promise<Buffer> {
    const invoice = await InvoiceService.getInvoiceById(userId, invoiceId) as any;

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: 'INVOICE',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Invoice details
            new Paragraph({
              children: [
                new TextRun({ text: 'Invoice Number: ', bold: true }),
                new TextRun(invoice.invoiceNumber),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Issue Date: ', bold: true }),
                new TextRun(new Date(invoice.issueDate).toLocaleDateString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Status: ', bold: true }),
                new TextRun(invoice.status),
              ],
              spacing: { after: 300 },
            }),

            // Company info
            new Paragraph({
              text: 'COMPANY INFORMATION',
              heading: 'Heading2',
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph(invoice.company?.name || ''),
            new Paragraph(invoice.company?.address || ''),
            new Paragraph(invoice.company?.email || ''),

            // Customer info
            new Paragraph({
              text: 'BILL TO',
              heading: 'Heading2',
              spacing: { before: 300, after: 100 },
            }),
            new Paragraph(invoice.customer.name),
            new Paragraph(invoice.customer.company || ''),
            new Paragraph(invoice.customer.email || ''),

            // Items table
            new Paragraph({
              text: 'ITEMS',
              heading: 'Heading2',
              spacing: { before: 300, after: 100 },
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Description', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Qty', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Price', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] }),
                  ],
                }),
                ...invoice.items.map((item: any) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.description)] }),
                      new TableCell({ children: [new Paragraph(item.quantity.toString())] }),
                      new TableCell({ children: [new Paragraph(`$${item.unitPrice.toFixed(2)}`)] }),
                      new TableCell({ children: [new Paragraph(`$${item.amount.toFixed(2)}`)] }),
                    ],
                  })
                ),
              ],
            }),

            // Totals
            new Paragraph({
              text: '',
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Subtotal: ', bold: true }),
                new TextRun(`$${invoice.subtotal.toFixed(2)}`),
              ],
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tax: ', bold: true }),
                new TextRun(`$${invoice.taxAmount.toFixed(2)}`),
              ],
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'TOTAL: ', bold: true, size: 28 }),
                new TextRun({ text: `$${invoice.totalAmount.toFixed(2)}`, size: 28 }),
              ],
              alignment: AlignmentType.RIGHT,
            }),

            // Notes
            ...(invoice.notes
              ? [
                  new Paragraph({
                    text: 'Notes',
                    heading: 'Heading3',
                    spacing: { before: 300, after: 100 },
                  }),
                  new Paragraph(invoice.notes),
                ]
              : []),
          ],
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}
