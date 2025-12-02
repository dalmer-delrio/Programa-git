const pool = require('../config/db');

exports.mostrarInicio = async (req, res) => {
  try {
    // Productos por categoría
    const [productos] = await pool.query(`
      SELECT p.*, c.nombre_categoria 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      ORDER BY c.nombre_categoria;
    `);

    // Ofertas reales desde la BD
    const [ofertas] = await pool.query(`
      SELECT *
      FROM productos
      WHERE oferta = 1
      LIMIT 5;
    `);

    // Agrupar productos por categoría
    const categorias = {};
    productos.forEach(p => {
      if (!categorias[p.nombre_categoria]) categorias[p.nombre_categoria] = [];
      categorias[p.nombre_categoria].push(p);
    });

    res.render("index", {
      categorias,
      ofertas
    });

  } catch (error) {
    console.error("Error en mostrarInicio:", error);
    res.status(500).send("Error cargando inicio");
  }
};