import { db } from "../db.js";

export const getAll = (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
}

export const getById = (req, res) => { }

export const getByCodigo = (req, res) => {
    const { codigo } = req.params;

    // Consulta NO SEGURA: interpolación directa del parámetro en la consulta
    const query = `SELECT * FROM productos WHERE codigo_barras = '${codigo}'`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
    });
}

export const create = (req, res) => {
    const { codigo_barras, nombre, cantidad, proveedor, fecha_caducidad, costo_compra, costo_venta, especificaciones } = req.body;

    // Verificar que todos los campos estén presentes
    if (!codigo_barras || !nombre || !cantidad || !proveedor || !fecha_caducidad || !costo_compra || !costo_venta || !especificaciones) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO productos (codigo_barras, nombre, cantidad, proveedor, fecha_caducidad, costo_compra, costo_venta, especificaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [codigo_barras, nombre, cantidad, proveedor, fecha_caducidad, costo_compra, costo_venta, especificaciones];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
        res.status(201).json({ message: 'Producto creado exitosamente' });
    });
}

export const update = (req, res) => {
    const { id } = req.params;
    const { codigo_barras, nombre, cantidad, proveedor, fecha_caducidad, costo_compra, costo_venta, especificaciones } = req.body;

    // Verificar que todos los campos estén presentes
    if (!codigo_barras || !nombre || !cantidad || !proveedor || !fecha_caducidad || !costo_compra || !costo_venta || !especificaciones) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'UPDATE productos SET codigo_barras = ?, nombre = ?, cantidad = ?, proveedor = ?, fecha_caducidad = ?, costo_compra = ?, costo_venta = ?, especificaciones = ? WHERE productos_id = ?';
    const values = [codigo_barras, nombre, cantidad, proveedor, fecha_caducidad, costo_compra, costo_venta, especificaciones, id];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    });
}

export const eliminar = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM productos WHERE productos_id = ?';
    const values = [id];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    });
}