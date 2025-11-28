// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// =========================
// 🔹 Catálogo público (sin login)
// =========================
router.get("/catalogo", async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.toLowerCase() : null;
    let productos = await productController.getAllProducts();

    // 🔍 Si el usuario busca algo, filtramos por nombre o descripción
    if (q) {
      productos = productos.filter(p =>
        (p.nombre_producto || "").toLowerCase().includes(q) ||
        (p.descripcion || "").toLowerCase().includes(q)
      );
    }

    res.render("catalogo_publico", { productos, q });
  } catch (err) {
    console.error("❌ Error cargando catálogo público:", err);
    res.status(500).send("Error cargando catálogo público");
  }
});

// =========================
// 🔹 Panel de administración
// =========================

// Mostrar todos los productos en el panel admin
router.get("/admin", async (req, res) => {
  try {
    const productos = await productController.getAllProducts();
    res.render("admin/admin_productos", {
      productos,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error(err);
    res.render("admin/admin_productos", {
      productos: [],
      error: "Error cargando productos",
      success: null,
    });
  }
});

// =========================
// 🔹 Catálogo protegido (dashboard del sistema)
// =========================
//router.get("/", productController.renderProductos);

// =========================
// 🔹 Agregar producto
// =========================
router.get("/agregar", productController.getAddProduct);
router.post("/agregar", productController.postAddProduct);

// =========================
// 🔹 Editar producto
// =========================
router.get("/editar/:id", productController.getEditProduct);
router.post("/editar/:id", productController.postEditProduct);

// =========================
// 🔹 Eliminar producto
// =========================
router.post("/eliminar/:id", productController.deleteProduct);

module.exports = router;
