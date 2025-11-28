const path = require("path");
const multer = require("multer");
const db = require("../models/db");

// 📦 Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/productos"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ============================================================
// 🔹 Obtener todos los productos (para catálogo público y admin)
// ============================================================
exports.getAllProducts = async () => {
  const [rows] = await db.query("SELECT * FROM productos");
  return rows;
};

// ============================================================
// 🔹 Mostrar todos los productos en panel admin
// ============================================================
exports.renderAdminProductos = async (req, res) => {
  try {
    const productos = await exports.getAllProducts();
    res.render("admin/admin_productos", {
      productos,
      success: req.query.success || null,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error cargando los productos");
  }
};

// ============================================================
// 🔹 Mostrar formulario de agregar producto
// ============================================================
exports.getAddProduct = (req, res) => {
  res.render("admin/agregar_producto", { error: null, success: null });
};

// ============================================================
// 🔹 Guardar nuevo producto
// ============================================================
exports.postAddProduct = [
  upload.single("imagen"),
  async (req, res) => {
    try {
      const { nombre, descripcion, categoria, precio, stock } = req.body;
      const imagen = req.file ? req.file.filename : "placeholder.png";

      await db.query(
        `INSERT INTO productos (nombre_producto, descripcion, precio, stock, imagen, id_categoria)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, descripcion, precio, stock, imagen, categoria || null]
      );

      res.redirect("/productos/admin?success=Producto agregado correctamente");
    } catch (error) {
      console.error(error);
      res.redirect("/productos/admin?error=Error al agregar producto");
    }
  },
];

// ============================================================
// 🔹 Mostrar formulario de edición
// ============================================================
exports.getEditProduct = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productos WHERE id_producto = ?", [req.params.id]);
    if (rows.length === 0) return res.redirect("/productos/admin?error=Producto no encontrado");

    res.render("admin/editar_producto", { producto: rows[0], error: null });
  } catch (error) {
    console.error(error);
    res.redirect("/productos/admin?error=Error al cargar producto");
  }
};

// ============================================================
// 🔹 Actualizar producto
// ============================================================
exports.postEditProduct = [
  upload.single("imagen"),
  async (req, res) => {
    try {
      const { nombre, descripcion, categoria, precio, stock } = req.body;
      const id = req.params.id;

      let updateQuery = `
        UPDATE productos
        SET nombre_producto = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ?
      `;
      const params = [nombre, descripcion, precio, stock, categoria || null];

      if (req.file) {
        updateQuery += `, imagen = ?`;
        params.push(req.file.filename);
      }

      updateQuery += ` WHERE id_producto = ?`;
      params.push(id);

      await db.query(updateQuery, params);
      res.redirect("/productos/admin?success=Producto actualizado correctamente");
    } catch (error) {
      console.error(error);
      res.redirect("/productos/admin?error=Error al actualizar producto");
    }
  },
];

// ============================================================
// 🔹 Eliminar producto
// ============================================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM productos WHERE id_producto = ?", [id]);
    res.redirect("/productos/admin?success=Producto eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.redirect("/productos/admin?error=Error al eliminar producto");
  }
};
