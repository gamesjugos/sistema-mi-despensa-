import { Router } from 'express';
import { getPayments, getPaymentStats, createPayment, deletePayment } from '../controllers/paymentController';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, createPaymentSchema } from '../middlewares/validate';

const router = Router();

// NOTE: /stats MUST be before /:id to avoid route conflict
router.get('/stats', authenticate, getPaymentStats);
router.get('/', authenticate, getPayments);
router.post('/', authenticate, validate(createPaymentSchema), createPayment);
router.delete('/:id', authenticate, deletePayment);

export default router;
