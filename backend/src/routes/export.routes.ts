import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:id/pdf', ExportController.exportPDF);
router.get('/:id/excel', ExportController.exportExcel);
router.get('/:id/word', ExportController.exportWord);
router.post('/:id/email', ExportController.emailInvoice);

export default router;
