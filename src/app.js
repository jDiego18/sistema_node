import express from "express";
import morgan from 'morgan';
import usuariosRoutes from "./routes/usuarios.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import cors from 'cors';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);

export default app;