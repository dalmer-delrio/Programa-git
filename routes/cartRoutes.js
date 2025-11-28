const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// 🛒 Mostrar carrito
router.get("/", cartController.renderCarrito);

// ➕ Agregar producto al carrito
router.post("/agregar", cartController.agregarAlCarrito);

// 🗑️ Eliminar producto del carrito (usa id_carrito)
router.get("/eliminar/:id", cartController.eliminarDelCarrito);

// 🧹 Vaciar carrito completo
router.get("/vaciar", cartController.vaciarCarrito);

// 💳 Finalizar compra
router.post("/finalizar", cartController.finalizarCompra);

// 🔄 Fusionar carrito local con el del usuario
router.post("/fusionar", cartController.fusionarCarrito);

module.exports = router;
