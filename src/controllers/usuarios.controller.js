import { db } from "../db.js";

export const getAll = (req, res) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
}

export const getById = (req, res) => { }

export const create = (req, res) => {
    const { nombre, apaterno, amaterno, clave, telefono, correo } = req.body;

    // Verificar que todos los campos estén presentes
    if (!nombre || !apaterno || !amaterno || !clave || !telefono || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO usuarios (nombre, apaterno, amaterno, clave, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [nombre, apaterno, amaterno, clave, telefono, correo];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    });
}

export const update = (req, res) => {
    const { id } = req.params;
    const { nombre, apaterno, amaterno, clave, telefono, correo } = req.body;

    // Verificar que todos los campos estén presentes
    if (!nombre || !apaterno || !amaterno || !clave || !telefono || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'UPDATE usuarios SET nombre = ?, apaterno = ?, amaterno = ?, clave = ?, telefono = ?, correo = ? WHERE usuarios_id = ?';
    const values = [nombre, apaterno, amaterno, clave, telefono, correo, id];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    });
}

export const eliminar = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM usuarios WHERE usuarios_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).json({ error: 'Error en el servidor' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    });
}