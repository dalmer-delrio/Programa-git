// models/cartModel.js
const db = require('./db');

// Obtener los productos del carrito de un usuario
exports.getCartByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT c.id_carrito, 
            p.id_producto, 
            p.nombre_producto AS nombre, 
            p.precio, 
            p.imagen, 
            c.cantidad
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ?`,
    [userId]
  );
  return rows;
};


// 🛒 Agregar producto al carrito (si existe, suma cantidad)
exports.addToCart = async (userId, id_producto, cantidad = 1) => {
  const [rows] = await db.query(
    "SELECT * FROM carrito WHERE id_usuario = ? AND id_producto = ?",
    [userId, id_producto]
  );

  if (rows.length > 0) {
    // Si el producto ya está en el carrito, actualizamos la cantidad
    await db.query(
      "UPDATE carrito SET cantidad = cantidad + ? WHERE id_usuario = ? AND id_producto = ?",
      [cantidad, userId, id_producto]
    );
  } else {
    // Si no existe, lo agregamos
    await db.query(
      "INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)",
      [userId, id_producto, cantidad]
    );
  }
};

// 🗑️ Eliminar un producto del carrito
exports.removeFromCart = async (id_carrito) => {
  await db.query("DELETE FROM carrito WHERE id_carrito = ?", [id_carrito]);
};


// 🧹 Vaciar todo el carrito
exports.clearCart = async (userId) => {
  await db.query("DELETE FROM carrito WHERE id_usuario = ?", [userId]);
};

// 📦 Obtener los productos del carrito (con info de producto)
exports.getCart = async (userId) => {
  const [rows] = await db.query(
    `SELECT c.id_producto, c.cantidad, p.nombre_producto, p.precio, p.imagen
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ?`,
    [userId]
  );
  return rows;
};

// 💰 Calcular total del carrito
exports.getTotal = async (userId) => {
  const [rows] = await db.query(
    `SELECT SUM(p.precio * c.cantidad) AS total
     FROM carrito c
     JOIN productos p ON c.id_producto = p.id_producto
     WHERE c.id_usuario = ?`,
    [userId]
  );
  return rows[0]?.total || 0;
};
