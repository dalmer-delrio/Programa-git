const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const path = require("path");

exports.getPerfil = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const user = await userModel.findById(req.session.userId);
  res.render("perfilCliente", { usuario: user, mensaje: null });
};

exports.postPerfil = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const { nombre, telefono, direccion, password } = req.body;
  const foto = req.file ? req.file.filename : null;

  try {
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await userModel.updatePerfil(req.session.userId, {
      nombre,
      telefono,
      direccion,
      password: hashedPassword,
    });

    if (foto) {
      await userModel.updateFoto(req.session.userId, foto);
    }

    const user = await userModel.findById(req.session.userId);
    res.render("perfilCliente", { usuario: user, mensaje: "✅ Perfil actualizado correctamente." });
  } catch (err) {
    console.error("Error actualizando perfil:", err);
    res.render("perfilCliente", { usuario: {}, mensaje: "❌ Error al actualizar perfil." });
  }
};
