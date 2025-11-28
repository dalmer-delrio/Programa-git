// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../models/db");

// ================================
// 🔹 Dashboard principal (Admin)
// ================================
router.get("/dashboard", async (req, res) => {
  try {
    // --- 🔸 Consultas de estadísticas generales ---
    const [[{ total_productos }]] = await db.query(
      "SELECT COUNT(*) AS total_productos FROM productos"
    );

    const [[{ total_clientes }]] = await db.query(
      "SELECT COUNT(*) AS total_clientes FROM usuarios WHERE rol = 'cliente'"
    );

    const [[{ total_pedidos }]] = await db.query(
      "SELECT COUNT(*) AS total_pedidos FROM ventas"
    );

    const [[{ total_ventas }]] = await db.query(
      "SELECT IFNULL(SUM(total), 0) AS total_ventas FROM ventas"
    );

    const stats = {
      productos: total_productos,
      clientes: total_clientes,
      pedidos: total_pedidos,
      ventas: total_ventas,
    };

    // --- 🔸 Últimas 5 ventas registradas ---
    const [pedidos] = await db.query(`
      SELECT 
        v.id_venta AS id_pedido,
        u.nombre AS nombre_cliente,
        v.fecha_venta AS fecha,
        v.total,
        v.estado
      FROM ventas v
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      ORDER BY v.fecha_venta DESC
      LIMIT 5
    `);

    // --- 🔸 Renderizar la vista ---
    res.render("admin/admin_dashboard", {
      stats,
      pedidos,
    });

  } catch (error) {
    console.error("❌ Error cargando dashboard del admin:", error);
    res.render("admin/admin_dashboard", {
      stats: { productos: 0, clientes: 0, pedidos: 0, ventas: 0 },
      pedidos: [],
    });
  }
});

module.exports = router;
