import { Router } from "express";
import { getAll, getById, getByCodigo, create, update, eliminar } from '../controllers/productos.controller.js';

const router = Router();

router.get('/getAll', getAll);
router.post('/getById', getById);
router.get('/getByCodigo/:codigo', getByCodigo);
router.post('/create', create);
router.put('/update/:id', update);
router.delete('/eliminar/:id', eliminar);

export default router;