import { Router } from "express";
import * as proveedoresController from "../controllers/proveedores.controller.js";

const router = Router();

router.get("/", proveedoresController.getAll);
router.get("/:id", proveedoresController.getById);
router.post("/", proveedoresController.create);
router.put("/:id", proveedoresController.update);
router.delete("/:id", proveedoresController.eliminar);

export default router;
