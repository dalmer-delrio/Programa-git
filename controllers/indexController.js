// controllers/indexController.js
const db = require("../config/db");

module.exports = {
  async mostrarInicio(req, res) {
    try {
      const [productos] = await db.query(
        `SELECT p.*, c.nombre_categoria 
         FROM productos p
         LEFT JOIN categorias c ON p.id_categoria = c.id_categoria`
      );

      // Agrupar productos por categoría
      const categorias = {};
      productos.forEach(p => {
        const categoria = p.nombre_categoria || "Otros";
        if (!categorias[categoria]) categorias[categoria] = [];
        categorias[categoria].push(p);
      });

      res.render("index", { categorias });
    } catch (error) {
      console.error("Error cargando index:", error);
      res.render("index", { categorias: {} });
    }
  }
};