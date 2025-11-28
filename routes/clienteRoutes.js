const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const upload = require("../middlewares/upload");



// Middleware para asegurar que esté logueado
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

// ✅ Dashboard principal del cliente
router.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboardCliente", { usuario: req.session.user || {} });
});

// ✅ Catálogo de productos
router.get("/productos", requireLogin, (req, res) => {
  res.render("productosCliente", { usuario: req.session.user || {} });
});

// ✅ Carrito de compras
router.get("/carrito", requireLogin, (req, res) => {
  res.render("carritoCliente", { usuario: req.session.user || {} });
});

// ✅ Perfil o configuración

router.get("/perfil", requireLogin, clienteController.getPerfil);
router.post("/perfil", requireLogin, upload.single("foto"), clienteController.postPerfil);

// ✅ Historial de pedidos
router.get("/historial", requireLogin, (req, res) => {
  res.render("historialCliente", { usuario: req.session.user || {} });
});

// ✅ Soporte
router.get("/soporte", requireLogin, (req, res) => {
  res.render("soporteCliente", { usuario: req.session.user || {} });
});

module.exports = router;
