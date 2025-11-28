const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./src/config/db");

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Importar rutas
const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const categoryRoutes = require("./src/routes/category.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");
const userRoutes = require("./src/routes/user.routes");
const shippingRoutes = require("./src/routes/shipping.routes");

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "API Craftivity - Backend funcionando correctamente",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Montar rutas
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shipping-addresses", shippingRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Ruta no encontrada",
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.warn(
        "⚠️  El servidor se iniciará sin conexión a la base de datos"
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📦 Entorno: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
