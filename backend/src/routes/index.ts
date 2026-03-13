import { Router } from 'express';
import authRoutes from './auth.routes';
import playerRoutes from './player.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/payments', paymentRoutes);

export default router;
