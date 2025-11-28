const db = require("./db");

// 🔍 Buscar usuario por correo
async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT *, `contraseña` AS password FROM usuarios WHERE correo = ?",
    [email]
  );
  return rows[0];
}

// 🔍 Buscar usuario por ID
async function findById(id) {
  const [rows] = await db.query(
    "SELECT *, `contraseña` AS password FROM usuarios WHERE id_usuario = ?",
    [id]
  );
  return rows[0];
}

// 🧩 Crear nuevo usuario (por defecto 'cliente')
async function createUser({
  nombre,
  correo,
  password,
  telefono = null,
  direccion = null,
  rol = "cliente",
}) {
  const [result] = await db.query(
    "INSERT INTO usuarios (nombre, correo, `contraseña`, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, correo, password, telefono, direccion, rol]
  );
  return result.insertId;
}

//  Guardar token de recuperación de contraseña
async function saveResetToken(userId, token, expiresAt) {
  // 🧹 Elimina tokens viejos del mismo usuario
  await db.query("DELETE FROM password_reset_tokens WHERE usuario_id = ?", [userId]);

  // 🆕 Inserta el nuevo token
  const [result] = await db.query(
    "INSERT INTO password_reset_tokens (usuario_id, token, expira_en) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

  return result.insertId;
}

//  Obtener token válido de recuperación (elimina si expiró)
async function getResetToken(token) {
  const [rows] = await db.query(
    "SELECT * FROM password_reset_tokens WHERE token = ?",
    [token]
  );
  const tokenData = rows[0];

  if (tokenData && new Date(tokenData.expira_en) < new Date()) {
    await deleteToken(token);
    return null;
  }

  return tokenData;
}

// 🔐 Actualizar contraseña
async function updatePassword(userId, newPassword) {
  const [result] = await db.query(
    "UPDATE usuarios SET `contraseña` = ? WHERE id_usuario = ?",
    [newPassword, userId]
  );
  return result.affectedRows;
}

// 🧹 Eliminar token usado o expirado
async function deleteToken(token) {
  await db.query("DELETE FROM password_reset_tokens WHERE token = ?", [token]);
}

// 📊 Contar todos los usuarios
async function countAll() {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM usuarios");
  return rows[0]?.total || 0;
}

// 👤 Actualizar perfil
async function updatePerfil(id, { nombre, telefono, direccion, password }) {
  let query = "UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ?";
  const params = [nombre, telefono, direccion];

  if (password) {
    query += ", `contraseña` = ?";
    params.push(password);
  }

  query += " WHERE id_usuario = ?";
  params.push(id);

  const [result] = await db.query(query, params);
  return result.affectedRows;
}

// 🖼️ Actualizar foto de perfil
async function updateFoto(id, filename) {
  const [result] = await db.query(
    "UPDATE usuarios SET foto = ? WHERE id_usuario = ?",
    [filename, id]
  );
  return result.affectedRows;
}

// ✅ Exportar todas las funciones
module.exports = {
  findByEmail,
  findById,
  createUser,
  saveResetToken,
  getResetToken,
  updatePassword,
  deleteToken,
  countAll,
  updatePerfil,
  updateFoto,
};
