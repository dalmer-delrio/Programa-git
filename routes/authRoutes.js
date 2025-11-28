const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ======== Autenticación ========
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

// ======== Registro ========
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

// ======== Recuperar contraseña ========
router.get("/forgot", authController.getForgot);
router.post("/forgot", authController.postForgot);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

module.exports = router;
