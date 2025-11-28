const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const saltRounds = 10;

// ======== CONFIGURACIÓN DE TRANSPORTER ========
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ======== VISTAS ========
exports.getRegister = (req, res) =>
  res.render("register", { error: null, success: null });

exports.getLogin = (req, res) =>
  res.render("login", { error: null });

exports.getForgot = (req, res) =>
  res.render("forgot", { message: null, error: null });

exports.getReset = (req, res) =>
  res.render("reset", { token: req.query.token, error: null });

// ======== REGISTRO DE USUARIOS ========
exports.postRegister = async (req, res) => {
  const { nombre, correo, password, confirmar, telefono, direccion } = req.body;

  try {
    if (password !== confirmar) {
      return res.render("register", {
        error: "Las contraseñas no coinciden.",
        success: null,
      });
    }

    const existing = await userModel.findByEmail(correo);
    if (existing) {
      return res.render("register", {
        error: "El correo ya está registrado.",
        success: null,
      });
    }

    const hashed = await bcrypt.hash(password, saltRounds);
    const userId = await userModel.createUser({
      nombre,
      correo,
      password: hashed,
      telefono,
      direccion,
    });

    if (!userId) {
      return res.render("register", {
        error: "Error al crear la cuenta. Intenta nuevamente.",
        success: null,
      });
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@ferreteria.com",
      to: correo,
      subject: "¡Bienvenido a La Ferretería del Barrio! 🛠️",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align:center;">
          <img src="${process.env.APP_URL || "http://localhost:3000"}/images/logo.png"
               alt="Logo La Ferretería del Barrio"
               style="width:120px; margin-bottom:15px;" />
          <h2 style="color:#007bff;">¡Hola ${nombre}!</h2>
          <p>Gracias por registrarte en <strong>La Ferretería del Barrio</strong>.</p>
          <p>Ya puedes iniciar sesión y comenzar a comprar tus productos favoritos.</p>
          <br>
          <a href="${process.env.APP_URL || "http://localhost:3000"}/login"
             style="display:inline-block; background:#007bff; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">
            Iniciar Sesión
          </a>
          <br><br>
          <p style="font-size:0.9em; color:#555;">Si no solicitaste esta cuenta, ignora este correo.</p>
        </div>
      `,
    });

    req.session.userId = userId;
    req.session.role = "cliente";

    res.render("register", {
      success: "Cuenta creada correctamente. Te hemos enviado un correo de bienvenida.",
      error: null,
    });
  } catch (err) {
    console.error("❌ Error en postRegister:", err);
    res.render("register", {
      error: "Ocurrió un error al registrar el usuario.",
      success: null,
    });
  }
};

// ======== LOGIN ========
exports.postLogin = async (req, res) => {
  const { correo, password, role } = req.body;
  console.log("🟢 Entrando a postLogin con:", req.body);

  try {
    const user = await userModel.findByEmail(correo);
    if (!user) return res.render("login", { error: "Credenciales inválidas" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render("login", { error: "Credenciales inválidas" });

    if (role === "admin" && user.rol !== "admin") {
      return res.render("login", { error: "No tienes acceso de administrador" });
    }
    if (role === "cliente" && user.rol !== "cliente") {
      return res.render("login", { error: "No tienes acceso de cliente" });
    }

    req.session.userId = user.id_usuario;
    req.session.role = user.rol;
    console.log("🟢 Sesión creada:", req.session);

    if (user.rol === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Error en login" });
  }
};

// ======== LOGOUT ========
exports.postLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};

// ======== RECUPERAR CONTRASEÑA ========
exports.postForgot = async (req, res) => {
  const { correo } = req.body;

  try {
    const user = await userModel.findByEmail(correo);
    if (!user) {
      return res.render("forgot", {
        message: "Si el correo existe, recibirás un email con instrucciones.",
        error: null,
      });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await userModel.saveResetToken(user.id_usuario, token, expiresAt);

    const resetUrl = `${
      process.env.APP_URL || "http://localhost:3000"
    }/reset?token=${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@ferreteria.com",
      to: correo,
      subject: "Restablecer contraseña — La Ferretería del Barrio 🔐",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc; padding: 40px 0;">
          <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: #007bff; padding: 20px; text-align: center;">
              <img src="${process.env.APP_URL || "http://localhost:3000"}/images/logo.png" 
                   alt="Logo La Ferretería del Barrio" 
                   style="width: 70px; height: 70px; border-radius: 50%; background: #fff; padding: 5px;">
              <h2 style="color: #ffffff; margin-top: 10px;">La Ferretería del Barrio</h2>
            </div>
            <div style="padding: 30px 25px; color: #333;">
              <h3 style="margin-top: 0;">Restablece tu contraseña</h3>
              <p>Hola <strong>${user.nombre}</strong>,</p>
              <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="background-color: #007bff; color: #fff; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: bold;">Restablecer contraseña</a>
              </div>
              <p>Si no solicitaste este cambio, puedes ignorar este mensaje. Este enlace expirará en <strong>1 hora</strong>.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
              <p style="font-size: 0.9rem; color: #777;">Este mensaje fue enviado automáticamente por el sistema de La Ferretería del Barrio.</p>
            </div>
          </div>
        </div>
      `,
    });

    res.render("forgot", {
      message: "Si el correo existe, recibirás un email con instrucciones.",
      error: null,
    });
  } catch (err) {
    console.error("❌ Error en postForgot:", err);
    res.render("forgot", {
      message: null,
      error: "Error enviando correo. Contacta al administrador.",
    });
  }
};

// ======== RESTABLECER CONTRASEÑA ========
exports.postReset = async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenRow = await userModel.getResetToken(token);
    if (!tokenRow) {
      return res.render("reset", { token, error: "Token inválido o expirado" });
    }

    if (new Date(tokenRow.expira_en) < new Date()) {
      await userModel.deleteToken(token);
      return res.render("reset", { token, error: "Token expirado" });
    }

    const hashed = await bcrypt.hash(password, saltRounds);
    await userModel.updatePassword(tokenRow.usuario_id, hashed);
    await userModel.deleteToken(token);

    res.render("reset_success");
  } catch (err) {
    console.error(err);
    res.render("reset", { token, error: "Error al restablecer contraseña" });
  }
};
  