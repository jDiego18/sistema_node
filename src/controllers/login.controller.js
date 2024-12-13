import { db } from "../db.js";

export const validateLogin = (req, res) => {
    const { userName, password } = req.body;

    // Verificar que ambos campos estén presentes
    if (!userName || !password) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
    const values = [userName, password];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            // Usuario encontrado y credenciales coinciden
            const usuario = results[0];
            return res.status(200).json({ success: true, userId: usuario.usuarios_id });
        } else {
            // Usuario no encontrado o credenciales incorrectas
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
}