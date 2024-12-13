import { Router } from "express";
import { create } from '../controllers/devoluciones.controller.js';

const router = Router();

//router.get('/getAll', getAll);
//router.post('/getById', getById);
//router.get('/getByCodigo/:codigo', getByCodigo);
router.post('/create', create);
//router.put('/update/:id', update);
//router.delete('/eliminar/:id', eliminar);

export default router;