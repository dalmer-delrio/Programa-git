const multer = require("multer");
const path = require("path");

// 📂 Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/usuarios");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `user-${req.session.userId}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Solo se permiten imágenes JPG o PNG"));
  },
});

module.exports = upload;
