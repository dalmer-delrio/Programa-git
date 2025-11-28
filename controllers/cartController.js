// controllers/cartController.js
const cartModel = require("../models/cartModel");
const db = require("../models/db");

// ============================================================
// 🔹 MOSTRAR CARRITO
// ============================================================
exports.renderCarrito = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const carrito = await cartModel.getCartByUser(req.session.userId);
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    res.render("carrito", { carrito, total, mensaje: null });
  } catch (error) {
    console.error("❌ Error cargando carrito:", error);
    res.status(500).send("Error cargando el carrito");
  }
};

// ============================================================
// 🔹 AGREGAR PRODUCTO AL CARRITO (desde dashboard o productos)
// ============================================================
exports.agregarAlCarrito = async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ success: false, message: "Debes iniciar sesión" });

  const { id_producto, cantidad } = req.body;

  if (!id_producto)
    return res.status(400).json({ success: false, message: "Falta el ID del producto" });

  const qty = parseInt(cantidad) || 1; // cantidad por defecto 1

  try {
    await cartModel.addToCart(req.session.userId, id_producto, qty);
    console.log(`🛒 Producto ${id_producto} agregado (${qty} uds) al carrito del usuario ${req.session.userId}`);

    // Si vienes desde un formulario tradicional
    if (!req.xhr) return res.redirect("/carrito");

    // Si lo haces con fetch/AJAX
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error agregando al carrito:", error);
    res.status(500).json({ success: false, message: "Error al agregar producto al carrito" });
  }
};

// ============================================================
// 🔹 ELIMINAR PRODUCTO
// ============================================================
exports.eliminarDelCarrito = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🧾 Eliminando producto con id_carrito:", id);
    await cartModel.removeFromCart(id);
    res.redirect("/carrito");
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).send("Error al eliminar producto del carrito");
  }
};


// ============================================================
// 🔹 VACIAR CARRITO
// ============================================================
exports.vaciarCarrito = async (req, res) => {
  try {
    await cartModel.clearCart(req.session.userId);
    res.redirect("/carrito");
  } catch (error) {
    console.error("❌ Error vaciando carrito:", error);
    res.status(500).send("Error al vaciar el carrito");
  }
};

// ============================================================
// 🔹 FINALIZAR COMPRA
// ============================================================
// ✅ FINALIZAR COMPRA con total en SweetAlert2
exports.finalizarCompra = async (req, res) => {
  try {
    const userId = req.session.userId;
    const carrito = await cartModel.getCartByUser(userId);

    if (carrito.length === 0) {
      return res.render("carrito", {
        carrito,
        total: 0,
        mensaje: "Tu carrito está vacío.",
      });
    }

    // 🔹 Calcular total
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    // 🔹 Insertar venta
    const [venta] = await db.query(
      "INSERT INTO ventas (id_usuario, total, fecha_venta) VALUES (?, ?, NOW())",
      [userId, total]
    );

    // 🔹 Insertar detalles de venta
    for (const item of carrito) {
      await db.query(
        "INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
        [venta.insertId, item.id_producto, item.cantidad, item.precio, item.precio * item.cantidad]
      );
    }

    // 🔹 Vaciar carrito
    await cartModel.clearCart(userId);

    // 🔹 Render con variable que activa SweetAlert2 con total
    res.render("carrito", {
      carrito: [],
      total: 0,
      totalCompra: total,
      mensajeSweet: "✅ Compra realizada con éxito. ¡Gracias por tu pedido!",
    });
  } catch (error) {
    console.error("❌ Error finalizando compra:", error);
    res.status(500).send("Error procesando la compra");
  }
};


// ============================================================
// 🔹 FUSIONAR CARRITO (por si el usuario tenía items sin sesión)
// ============================================================
exports.fusionarCarrito = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productos } = req.body;

    if (!userId || !productos || productos.length === 0)
      return res.json({ success: true, message: "Sin productos para fusionar" });

    for (const p of productos) {
      await cartModel.addToCart(userId, p.id, p.cantidad || 1);
    }

    res.json({ success: true, message: "Carrito fusionado correctamente" });
  } catch (error) {
    console.error("❌ Error fusionando carrito:", error);
    res.status(500).json({ success: false, message: "Error al fusionar carrito" });
  }
};
