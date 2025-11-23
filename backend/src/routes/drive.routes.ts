import { Router } from 'express';
import { DriveController } from '../controllers/drive.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/:id/upload', DriveController.uploadInvoice);
router.post('/list', DriveController.listInvoices);
router.post('/sync-all', DriveController.syncAll);

export default router;
