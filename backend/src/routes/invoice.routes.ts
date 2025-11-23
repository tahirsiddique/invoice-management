import { Router } from 'express';
import { body } from 'express-validator';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { auditLog } from '../middleware/audit';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create invoice
router.post(
  '/',
  [
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.description').notEmpty().withMessage('Item description is required'),
    body('items.*.quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  ],
  validate,
  auditLog('CREATE', 'INVOICE'),
  InvoiceController.createInvoice
);

// Get all invoices
router.get('/', InvoiceController.getInvoices);

// Get invoice by ID
router.get('/:id', InvoiceController.getInvoiceById);

// Update invoice
router.put(
  '/:id',
  auditLog('UPDATE', 'INVOICE'),
  InvoiceController.updateInvoice
);

// Delete invoice
router.delete(
  '/:id',
  auditLog('DELETE', 'INVOICE'),
  InvoiceController.deleteInvoice
);

// Duplicate invoice
router.post(
  '/:id/duplicate',
  auditLog('DUPLICATE', 'INVOICE'),
  InvoiceController.duplicateInvoice
);

export default router;
