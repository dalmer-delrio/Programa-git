require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // ✅ nuevo
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require("./routes/adminRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const historialRoutes = require("./routes/historialRoutes");
const publicRoutes = require('./routes/publicRoutes');



const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambialo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// 🔹 Middleware para que EJS tenga acceso a la sesión
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


// Rutas´
app.use("/", indexRoutes);
app.use("/", publicRoutes);
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes); // ✅ agregado
app.use('/productos', productRoutes);
app.use('/carrito', cartRoutes);
app.use("/admin", adminRoutes);
app.use("/", clienteRoutes);
app.use("/historial", historialRoutes);




// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/ofertas', (req, res) => res.render('ofertas'));
app.get('/contacto', (req, res) => res.render('contacto'));

const PORT = process.env.PORT || 3000;
console.log("Carpeta de vistas:", app.get("views"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
