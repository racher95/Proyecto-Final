/**
 * Configuración centralizada de la aplicación
 * Constantes globales y configuraciones del sitio
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Configuración del carrito y pagos
// Contiene todos los tipos de envío con sus porcentajes y plazos
const CART_CONFIG = {
  // Opciones de envío: el porcentaje se aplica sobre el subtotal
  // Ej: si compra $1000, envío premium cuesta $150 (15%)
  SHIPPING_OPTIONS: {
    premium: {
      name: "Premium 2-5 días",
      percentage: 0.15,
      days: "2 a 5 días",
    },
    express: {
      name: "Express 5-8 días",
      percentage: 0.07,
      days: "5 a 8 días",
    },
    standard: {
      name: "Standard 12-15 días",
      percentage: 0.05,
      days: "12 a 15 días",
    },
  },
  TAX_RATE: 0.22, // IVA del 22% (Uruguay)
  CURRENCY: "UYU", // Moneda base (pesos uruguayos)
};

// Estados posibles de un pedido
// Por ahora solo usamos "pending", pero cuando tengamos backend podremos actualizar los estados
const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// URLs de la API
const API_CONFIG = {
  BASE_URL: "https://racher95.github.io/diy-emercado-api",
  CATEGORIES: "https://racher95.github.io/diy-emercado-api/cats/cat.json",
  PRODUCTS_BASE: "https://racher95.github.io/diy-emercado-api/cats_products/",
  PRODUCTS_DETAIL: "https://racher95.github.io/diy-emercado-api/products/",
  COMMENTS_BASE:
    "https://racher95.github.io/diy-emercado-api/products_comments/",
  HOT_SALES: "https://racher95.github.io/diy-emercado-api/cats/hot_sales.json",
  FEATURED: "https://racher95.github.io/diy-emercado-api/cats/featured.json",
  COMMENTS_WORKER: "https://craftivity-comments-worker.racher95.workers.dev",
};
