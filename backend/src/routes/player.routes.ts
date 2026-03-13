import { Router } from 'express';
import { getPlayers, createPlayer, getPlayerById, updatePlayer, deletePlayer } from '../controllers/playerController';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, createPlayerSchema } from '../middlewares/validate';

const router = Router();

// All player routes require authentication
router.get('/', authenticate, getPlayers);
router.post('/', authenticate, validate(createPlayerSchema), createPlayer);
router.get('/:id', authenticate, getPlayerById);
router.put('/:id', authenticate, updatePlayer);
router.delete('/:id', authenticate, deletePlayer);

export default router;
