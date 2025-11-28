
console.log("✅ Entrando al dashboardController!")

// controllers/dashboardController.js
const db = require("../config/db");

exports.renderDashboard = async (req, res) => {
  try {
    // 🧠 Validar sesión
    if (!req.session.userId || req.session.role !== "cliente") {
      return res.redirect("/login");
    }

    // 🧩 Consulta de productos con su categoría
    const [productos] = await db.query(`
      SELECT 
        p.id_producto, 
        p.nombre_producto, 
        p.precio, 
        p.imagen, 
        c.nombre_categoria 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      ORDER BY c.nombre_categoria;
    `);

    // 📤 Renderizar vista con resultados
    res.render("dashboard", { 
      usuario: req.session, 
      productos 
    });
  } catch (error) {
    console.error("❌ Error al cargar el dashboard:", error);
    res.render("dashboard", { usuario: req.session, productos: [] });
  }
};
