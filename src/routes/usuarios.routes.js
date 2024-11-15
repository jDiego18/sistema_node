import { Router } from 'express';
import { getAll, getById, create, update, eliminar } from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/getAll', getAll);
router.post('/getById', getById);
router.post('/create', create);
router.put('/update/:id', update);
router.delete('/eliminar/:id', eliminar);

export default router;