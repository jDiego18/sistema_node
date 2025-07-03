import { db } from "../db.js";

export const getAll = (req, res) => {
    const query = 'SELECT * FROM proveedores';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
};

export const getById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM proveedores WHERE proveedor_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ error: 'Proveedor no encontrado' });
        }
    });
};

export const create = (req, res) => {
    const { nombre, contacto, telefono, direccion } = req.body;
    if (!nombre || !contacto || !telefono || !direccion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'INSERT INTO proveedores (nombre, contacto, telefono, direccion) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, contacto, telefono, direccion], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.status(201).json({ message: 'Proveedor creado exitosamente' });
    });
};

export const update = (req, res) => {
    const { id } = req.params;
    const { nombre, contacto, telefono, direccion } = req.body;
    if (!nombre || !contacto || !telefono || !direccion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const query = 'UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, direccion = ? WHERE proveedor_id = ?';
    db.query(query, [nombre, contacto, telefono, direccion, id], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json({ message: 'Proveedor actualizado exitosamente' });
    });
};

export const eliminar = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM proveedores WHERE proveedor_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.status(200).json({ message: 'Proveedor eliminado exitosamente' });
    });
};
