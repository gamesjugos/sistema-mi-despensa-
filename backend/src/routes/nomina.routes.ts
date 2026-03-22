import { Router } from 'express';
import { getConfig, updateConfig, getRecordsByMonth, saveRecord } from '../controllers/nominaController';

const router = Router();

// Configuracion
router.get('/config', getConfig);
router.post('/config', updateConfig);

// Registros
router.get('/records', getRecordsByMonth);
router.post('/records', saveRecord);

export default router;
