import { Router } from 'express';
import { login, getAdmins, createAdmin, updateAdmin, deleteAdmin, toggleAdminStatus } from '../controllers/authController';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.middleware';
import { validate, loginSchema, createAdminSchema } from '../middlewares/validate';

const router = Router();

// Public
router.post('/login', validate(loginSchema), login);

// Protected – SUPERADMIN only
router.get('/admins', authenticate, requireSuperAdmin, getAdmins);
router.post('/admins', authenticate, requireSuperAdmin, validate(createAdminSchema), createAdmin);
router.put('/admins/:id', authenticate, requireSuperAdmin, updateAdmin);
router.patch('/admins/:id/toggle', authenticate, requireSuperAdmin, toggleAdminStatus);
router.delete('/admins/:id', authenticate, requireSuperAdmin, deleteAdmin);

export default router;
