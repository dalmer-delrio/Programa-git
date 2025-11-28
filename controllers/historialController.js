// controllers/historialController.js
const db = require("../models/db");

exports.renderHistorial = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const [ventas] = await db.query(
      `
      SELECT v.id_venta, v.fecha_venta, v.total, COUNT(d.id_detalle) AS cantidad_productos
      FROM ventas v
      LEFT JOIN detalle_venta d ON v.id_venta = d.id_venta
      WHERE v.usuario_id = ?
      GROUP BY v.id_venta, v.fecha_venta, v.total
      ORDER BY v.fecha_venta DESC
      `,
      [req.session.userId]
    );

    res.render("historial", { usuario: req.session.userId, ventas });
  } catch (error) {
    console.error("Error cargando historial:", error);
    res.render("historial", { usuario: req.session.userId, ventas: [] });
  }
};

// Ver detalle de un pedido
exports.verDetallePedido = async (req, res) => {
  const { id } = req.params;

  try {
    const [detalles] = await db.query(
      `
      SELECT d.id_detalle, p.nombre, p.precio, d.cantidad, (p.precio * d.cantidad) AS subtotal
      FROM detalle_venta d
      JOIN productos p ON d.id_producto = p.id_producto
      WHERE d.id_venta = ?
      `,
      [id]
    );

    res.render("detalle-pedido", { detalles, idPedido: id });
  } catch (error) {
    console.error("Error cargando detalle del pedido:", error);
    res.status(500).send("Error al cargar detalle del pedido");
  }
};
