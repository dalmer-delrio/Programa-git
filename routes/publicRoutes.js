const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// 🔹 Catálogo público (con búsqueda opcional)
router.get("/catalogo", async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.toLowerCase() : "";
    let productos = await productController.getAllProducts();

    // 🔍 Si hay término de búsqueda, filtra productos
    if (q) {
  productos = productos.filter(p => {
    const nombre = p.nombre ? p.nombre.toLowerCase() : "";
    const descripcion = p.descripcion ? p.descripcion.toLowerCase() : "";
    return nombre.includes(q) || descripcion.includes(q);
  });
}


    // 🔹 Enviar productos y término buscado a la vista
    res.render("catalogo_publico", { productos, q });
  } catch (error) {
    console.error("Error cargando catálogo público:", error);
    res.status(500).send("Error al cargar el catálogo público.");
  }
});

// 🔹 Carrito público
router.get("/carrito_publico", (req, res) => {
  res.render("carrito_publico");
});

module.exports = router;
