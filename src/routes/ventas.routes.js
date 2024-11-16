import { Router } from 'express';
import { getVentaId, create, registrarProductosVenta, downloadTicket } from '../controllers/ventas.controller.js';

const router = Router();

router.get('/getVentaId', getVentaId);
router.post('/create', create);
router.post('/registrarProductosVenta', registrarProductosVenta);
router.get('/downloadTicket/:ventas_id', downloadTicket);

export default router;