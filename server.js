const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3001;

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));

// Configuración de MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '16401802',
    database: 'prueba'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Hola Mundo desde el servidor Express');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo http://localhost:${PORT}`);
});

app.get('/pacientes', (req, res) => {
    const query = 'SELECT * FROM paciente';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});