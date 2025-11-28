// models/orderModel.js
const db = require('./db');

// ✅ Contar todas las ventas
exports.countAll = async () => {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM ventas");
  return rows[0].total || 0;
};

// ✅ Obtener las últimas 5 ventas (con nombre del cliente)
exports.getLatest = async (limit = 5) => {
  const [rows] = await db.query(`
    SELECT v.id_venta AS id_pedido, u.nombre AS nombre_cliente, v.total, v.fecha_venta AS fecha
    FROM ventas v
    JOIN usuarios u ON v.id_usuario = u.id_usuario
    ORDER BY v.fecha_venta DESC
    LIMIT ?
  `, [limit]);
  return rows;

};
