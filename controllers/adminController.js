// controllers/adminController.js
const productModel = require("../models/Product");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

exports.renderDashboard = async (req, res) => {
  if (!req.session.userId || req.session.role !== "admin") {
    return res.redirect("/login");
  }

  try {
    const totalUsuarios = await userModel.countAll();
    const totalProductos = await productModel.countAll();
    const totalPedidos = await orderModel.countAll();
    const ultimosPedidos = await orderModel.getLatest(5);

    res.render("admin_dashboard", {
      usuario: req.session.userId,
      stats: { totalUsuarios, totalProductos, totalPedidos },
      ultimosPedidos,
    });
  } catch (err) {
    console.error("Error cargando dashboard admin:", err);
    res.render("admin_dashboard", {
      usuario: req.session.userId,
      stats: { totalUsuarios: 0, totalProductos: 0, totalPedidos: 0 },
      ultimosPedidos: [],
    });
  }
};
