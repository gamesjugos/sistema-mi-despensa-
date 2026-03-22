import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import nominaRoutes from './nomina.routes';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/nomina', nominaRoutes);

export default router;
