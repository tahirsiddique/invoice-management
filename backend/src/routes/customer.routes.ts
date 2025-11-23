import { Router } from 'express';
import { body } from 'express-validator';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Customer name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ],
  validate,
  auditLog('CREATE', 'CUSTOMER'),
  CustomerController.createCustomer
);

router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomerById);

router.put(
  '/:id',
  auditLog('UPDATE', 'CUSTOMER'),
  CustomerController.updateCustomer
);

router.delete(
  '/:id',
  auditLog('DELETE', 'CUSTOMER'),
  CustomerController.deleteCustomer
);

router.patch('/:id/toggle-status', CustomerController.toggleStatus);

export default router;
