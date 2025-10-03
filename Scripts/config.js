/**
 * Configuración centralizada de la aplicación
 * Constantes globales y configuraciones del sitio
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Configuración del carrito y pagos
const CART_CONFIG = {
  SHIPPING_COST: 350, // Costo de envío fijo en UYU
  TAX_RATE: 0.22, // IVA del 22%
  CURRENCY: "UYU", // Moneda base del sitio
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
