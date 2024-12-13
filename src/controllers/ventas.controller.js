import { db } from "../db.js";
import PDFDocument from 'pdfkit';

export const getAll = (req, res) => {
    const query = 'SELECT * FROM ventas';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
}

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

        res.status(201).json({ success: true, message: 'Venta creada exitosamente', id: results.insertId });
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

export const getProductosByVentaId = (req, res) => {
    const { ventas_id } = req.params;

    const query = 'SELECT vp.*, p.nombre FROM ventas_productos vp JOIN productos p ON vp.productos_id = p.productos_id WHERE vp.ventas_id = ?';

    db.query(query, [ventas_id], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        res.status(200).json(results);
    });
}

export const downloadTicket = (req, res) => {
    const { id, opcion } = req.params;

    let queryVenta, queryProductos;

    if (opcion === 'Venta') {
        queryVenta = 'SELECT * FROM ventas WHERE ventas_id = ?';
        queryProductos = 'SELECT vp.*, p.nombre FROM ventas_productos vp JOIN productos p ON vp.productos_id = p.productos_id WHERE vp.ventas_id = ?';
    } else if (opcion === 'Devolucion') {
        queryVenta = 'SELECT d.*, v.cliente FROM devolucion d JOIN ventas v ON d.ventas_id = v.ventas_id WHERE devolucion_id = ?';
        queryProductos = 'SELECT d.*, p.nombre, p.costo_compra FROM devolucion d JOIN productos p ON d.productos_id = p.productos_id WHERE d.devolucion_id = ?';
    } else {
        return res.status(400).json({ success: false, message: 'Opción inválida' });
    }

    db.query(queryVenta, [id], (err, ventaResults) => {
        if (err) {
            console.error('Error ejecutando la consulta de venta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (ventaResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Venta no encontrada' });
        }

        const venta = ventaResults[0];

        db.query(queryProductos, [id], (err, productosResults) => {
            if (err) {
                console.error('Error ejecutando la consulta de productos:', err);
                return res.status(500).json({ success: false, message: 'Error en el servidor' });
            }

            const producto = productosResults[0];

            const doc = new PDFDocument();
            let filename = `ticket_${id}.pdf`;
            filename = encodeURIComponent(filename);
            res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.fontSize(20).text('STORE LA ESCONDIDA', { align: 'center' });

            doc.moveDown();
            doc.fontSize(14).text(`Concepto: ${opcion}`, { align: 'left' });
            doc.text(`Folio: ${id}`, { align: 'left' });
            doc.text(`Fecha: ${venta.fecha_venta || venta.fecha_devolucion}`, { align: 'left' });
            doc.text(`Atendido por: ${venta.atendido_por}`, { align: 'left' });
            doc.text(`Cliente: ${venta.cliente}`, { align: 'left' });

            doc.moveDown();

            // Convertir valores de tipo BIT a números
            venta.es_cambio = venta.es_cambio ? venta.es_cambio[0] : 0;
            venta.es_devolucion = venta.es_devolucion ? venta.es_devolucion[0] : 0;

            if (venta.es_cambio == 1) {
                doc.fontSize(16).text('Producto:', { align: 'left' });
                doc.fontSize(12).text(`- ${producto.nombre}: ${producto.cantidad_venta || producto.cantidad_devuelta} x 0 = 0`, { align: 'left' });
                doc.moveDown();
                doc.fontSize(14).text(`Forma de pago: N/A`, { align: 'left' });
                doc.text(`Subtotal: 0`, { align: 'left' });
                doc.text(`Total: 0`, { align: 'left' });
                doc.text(`Pago con: 0`, { align: 'left' });
                doc.text(`Cambio: ${producto.total_devuelto}`, { align: 'left' });

                doc.moveDown();
                doc.fontSize(10).text('*Se le ha cambiado el producto', { align: 'left' });
            } else {
                doc.fontSize(16).text('Productos:', { align: 'left' });
                // Si es una venta o es devolucion recorrer el resultado del producto
                productosResults.forEach(producto => {
                    doc.fontSize(12).text(`- ${producto.nombre}: ${producto.cantidad_venta || producto.cantidad_devuelta} x ${producto.precio_unitario || producto.costo_compra} = ${producto.total_unitario || producto.total_devuelto}`, { align: 'left' });
                });

                doc.moveDown();
                doc.fontSize(14).text(`Forma de pago: ${venta.forma_pago || 'N/A'}`, { align: 'left' });
                doc.text(`Subtotal: ${venta.subtotal || '0'}`, { align: 'left' });
                doc.text(`Total: ${venta.total || '0'}`, { align: 'left' });
                doc.text(`Pago con: ${venta.pago_con || '0'}`, { align: 'left' });
                doc.text(`Cambio: ${venta.cambio || producto.total_devuelto}`, { align: 'left' });
            }
            doc.end();
            doc.pipe(res);
        });
    });
}