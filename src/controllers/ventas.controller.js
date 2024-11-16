import { db } from "../db.js";
import PDFDocument from 'pdfkit';

export const getVentaId = (req, res) => {
    const query = 'SELECT MAX(ventas_id) AS maxId FROM ventas';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        const maxId = results[0].maxId;
        const newId = maxId ? maxId + 1 : 1; // Si no hay ventas, empieza desde 1

        res.status(200).json({ newId });
    });
}

export const create = (req, res) => {
    const { fecha_venta, atendido_por, cliente, forma_pago, subtotal, total, pago_con, cambio, banco, no_tarjeta } = req.body;

    // Verificar que todos los campos obligatorios estén presentes
    if (!fecha_venta || !atendido_por || !cliente || !forma_pago || !subtotal || !total || !pago_con) {
        return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben estar presentes' });
    }

    let query;
    let values;

    if (forma_pago === 'Efectivo') {
        query = 'INSERT INTO ventas (fecha_venta, atendido_por, cliente, forma_pago, subtotal, total, pago_con, cambio, banco, no_tarjeta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)';
        values = [fecha_venta, atendido_por, cliente, forma_pago, subtotal, total, pago_con, cambio];
    } else {
        query = 'INSERT INTO ventas (fecha_venta, atendido_por, cliente, forma_pago, subtotal, total, pago_con, cambio, banco, no_tarjeta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        values = [fecha_venta, atendido_por, cliente, forma_pago, subtotal, total, pago_con, cambio, banco, no_tarjeta];
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        res.status(201).json({ success: true, message: 'Venta creada exitosamente', ventaId: results.insertId });
    });
}

export const registrarProductosVenta = (req, res) => {
    const { ventaId, productos } = req.body;

    if (!ventaId || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'Datos inválidos' });
    }

    const queries = productos.map(producto => {
        const { productos_id, precio_unitario, cantidad_venta, total_unitario } = producto;

        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO ventas_productos (ventas_id, productos_id, precio_unitario, cantidad_venta, total_unitario) VALUES (?, ?, ?, ?, ?)';
            const values = [ventaId, productos_id, precio_unitario, cantidad_venta, total_unitario];

            db.query(query, values, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const updateQuery = 'UPDATE productos SET cantidad = cantidad - ? WHERE productos_id = ?';
                const updateValues = [cantidad_venta, productos_id];

                db.query(updateQuery, updateValues, (err, results) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                });
            });
        });
    });

    Promise.all(queries)
        .then(() => {
            res.status(201).json({ success: true, message: 'Productos registrados y cantidades actualizadas exitosamente' });
        })
        .catch(err => {
            console.error('Error ejecutando las consultas:', err);
            res.status(500).json({ success: false, message: 'Error en el servidor' });
        });
}

export const downloadTicket = (req, res) => {
    const { ventas_id } = req.params;

    const queryVenta = 'SELECT * FROM ventas WHERE ventas_id = ?';
    const queryProductos = 'SELECT vp.*, p.nombre FROM ventas_productos vp JOIN productos p ON vp.productos_id = p.productos_id WHERE vp.ventas_id = ?';

    db.query(queryVenta, [ventas_id], (err, ventaResults) => {
        if (err) {
            console.error('Error ejecutando la consulta de venta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (ventaResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Venta no encontrada' });
        }

        const venta = ventaResults[0];

        db.query(queryProductos, [ventas_id], (err, productosResults) => {
            if (err) {
                console.error('Error ejecutando la consulta de productos:', err);
                return res.status(500).json({ success: false, message: 'Error en el servidor' });
            }

            const doc = new PDFDocument();
            let filename = `ticket_${ventas_id}.pdf`;
            filename = encodeURIComponent(filename);
            res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.fontSize(20).text('STORE LA ESCONDIDA', { align: 'center' });

            doc.moveDown();
            doc.fontSize(14).text(`Fecha: ${venta.fecha_venta}`, { align: 'left' });
            doc.text(`Atendido por: ${venta.atendido_por}`, { align: 'left' });
            doc.text(`Cliente: ${venta.cliente}`, { align: 'left' });

            doc.moveDown();
            doc.fontSize(16).text('Productos:', { align: 'left' });

            productosResults.forEach(producto => {
                doc.fontSize(12).text(`- ${producto.nombre}: ${producto.cantidad_venta} x ${producto.precio_unitario} = ${producto.total_unitario}`, { align: 'left' });
            });

            doc.moveDown();
            doc.fontSize(14).text(`Forma de pago: ${venta.forma_pago}`, { align: 'left' });
            doc.text(`Subtotal: ${venta.subtotal}`, { align: 'left' });
            doc.text(`Total: ${venta.total}`, { align: 'left' });
            doc.text(`Pago con: ${venta.pago_con}`, { align: 'left' });
            doc.text(`Cambio: ${venta.cambio}`, { align: 'left' });

            doc.end();
            doc.pipe(res);
        });
    });
}