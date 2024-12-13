import { Router } from 'express';
import { getAll, getVentaId, create, registrarProductosVenta, getProductosByVentaId, downloadTicket } from '../controllers/ventas.controller.js';

const router = Router();

router.get('/getAll', getAll);
router.get('/getVentaId', getVentaId);
router.post('/create', create);
router.post('/registrarProductosVenta', registrarProductosVenta);
router.get('/getProductosByVentaId/:ventas_id', getProductosByVentaId);
router.get('/downloadTicket/:id/:opcion', downloadTicket);

export default router;