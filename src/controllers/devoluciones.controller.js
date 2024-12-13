import { db } from "../db.js";

export const create = (req, res) => {
    const { ventas_id, productos_id, es_devolucion, es_cambio, cantidad_devuelta, atendido_por } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!ventas_id || !productos_id || !cantidad_devuelta || !atendido_por) {
        return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben estar presentes' });
    }

    // Validar que la cantidad devuelta no sea mayor que la cantidad vendida
    const queryVentaProducto = 'SELECT cantidad_venta, precio_unitario FROM ventas_productos WHERE ventas_id = ? AND productos_id = ?';
    db.query(queryVentaProducto, [ventas_id, productos_id], (err, ventaProductoResults) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (ventaProductoResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado en la venta' });
        }

        const { cantidad_venta, precio_unitario } = ventaProductoResults[0];

        // Validar que la cantidad devuelta no sea mayor que la cantidad vendida
        if (cantidad_devuelta > cantidad_venta) {
            return res.status(400).json({ success: false, message: 'La cantidad devuelta no puede ser mayor que la cantidad vendida' });
        }

        // Verificar si ya existe una devolución para la misma venta y producto
        const queryDevolucion = 'SELECT SUM(cantidad_devuelta) AS total_devuelta FROM devolucion WHERE ventas_id = ? AND productos_id = ?';
        db.query(queryDevolucion, [ventas_id, productos_id], (err, devolucionResults) => {
            if (err) {
                console.error('Error ejecutando la consulta:', err);
                return res.status(500).json({ success: false, message: 'Error en el servidor' });
            }

            const totalDevuelta = devolucionResults[0].total_devuelta || 0;

            // Validar que la cantidad devuelta no exceda la cantidad vendida menos las devoluciones anteriores
            if (cantidad_devuelta > (cantidad_venta - totalDevuelta)) {
                return res.status(400).json({ success: false, message: 'La cantidad devuelta excede la cantidad disponible para devolución' });
            }

            // Calcular el total devuelto si es una devolución
            const total_devuelto = es_devolucion ? cantidad_devuelta * precio_unitario : 0;
            const fecha_devolucion = new Date();

            // Insertar la devolución en la tabla devolucion
            const queryInsertDevolucion = 'INSERT INTO devolucion (ventas_id, productos_id, fecha_devolucion, es_devolucion, es_cambio, cantidad_devuelta, total_devuelto, atendido_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const valuesDevolucion = [ventas_id, productos_id, fecha_devolucion, es_devolucion, es_cambio, cantidad_devuelta, total_devuelto, atendido_por];

            db.query(queryInsertDevolucion, valuesDevolucion, (err, resultsD) => {
                if (err) {
                    console.error('Error ejecutando la consulta:', err);
                    return res.status(500).json({ success: false, message: 'Error en el servidor' });
                }

                // Registrar la información del producto en productos_devueltos
                const queryProductosDevueltos = 'INSERT INTO productos_devueltos (productos_id, cantidad) VALUES (?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)';
                const valuesProductosDevueltos = [productos_id, cantidad_devuelta];

                db.query(queryProductosDevueltos, valuesProductosDevueltos, (err, resultsPD) => {
                    if (err) {
                        console.error('Error ejecutando la consulta:', err);
                        return res.status(500).json({ success: false, message: 'Error en el servidor' });
                    }

                    // Si es un cambio, actualizar la cantidad en la tabla productos
                    if (es_cambio) {
                        const queryUpdateProducto = 'UPDATE productos SET cantidad = cantidad - ? WHERE productos_id = ?';
                        const valuesUpdateProducto = [cantidad_devuelta, productos_id];

                        db.query(queryUpdateProducto, valuesUpdateProducto, (err, resultsC) => {
                            if (err) {
                                console.error('Error ejecutando la consulta:', err);
                                return res.status(500).json({ success: false, message: 'Error en el servidor' });
                            }

                            res.status(201).json({ success: true, message: 'Cambio registrado exitosamente', id: resultsD.insertId });
                        });
                    } else {
                        res.status(201).json({ success: true, message: 'Devolución registrada exitosamente', id: resultsD.insertId });
                    }
                });
            });
        });
    });
}