// models/Product.js
const db = require('./db');

// Obtener todos los productos
exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM productos');
  return rows;
};

// Contar todos los productos (para el dashboard admin)
exports.countAll = async () => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM productos');
  return rows[0].total || 0;
};

// Buscar un producto por su ID
exports.findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
  return rows[0];
};

// Crear un producto nuevo
exports.create = async (nombre, descripcion, precio, stock, imagen) => {
  const [result] = await db.query(
    'INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)',
    [nombre, descripcion, precio, stock, imagen]
  );
  return result.insertId;
};

// Actualizar un producto existente
exports.update = async (id, nombre, descripcion, precio, stock, imagen) => {
  await db.query(
    'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ? WHERE id_producto = ?',
    [nombre, descripcion, precio, stock, imagen, id]
  );
};

// Eliminar un producto
exports.delete = async (id) => {
  await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
};
