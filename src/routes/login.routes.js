import { Router } from 'express';
import { validateLogin } from '../controllers/login.controller.js';

const router = Router();

router.post('/validateLogin', validateLogin);

export default router;