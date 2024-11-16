import { Router } from 'express';
import { getAll, getById, create, update, eliminar, getUsuariosClientes } from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.post('/create', create);
router.put('/update/:id', update);
router.delete('/eliminar/:id', eliminar);
router.get('/getUsuariosClientes', getUsuariosClientes);

export default router;