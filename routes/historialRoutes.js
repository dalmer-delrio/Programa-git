// routes/historialRoutes.js
const express = require("express");
const router = express.Router();
const historialController = require("../controllers/historialController");

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect("/login");
}

router.get("/", isAuthenticated, historialController.renderHistorial);
// Ver detalles de un pedido específico
router.get("/:id", isAuthenticated, historialController.verDetallePedido);


module.exports = router;
