/**
 * Configuración centralizada de la aplicación
 * Constantes globales y configuraciones del sitio
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

// URLs de la API - Backend Node.js + Express + MariaDB
const API_CONFIG = {
  // Base URL del backend local
  BASE_URL: "http://localhost:3000/api",

  // Endpoints REST
  CATEGORIES: "http://localhost:3000/api/categories",
  PRODUCTS: "http://localhost:3000/api/products",
  PRODUCTS_FEATURED: "http://localhost:3000/api/products/featured",
  PRODUCTS_FLASH_SALES: "http://localhost:3000/api/products/flash-sales",
  PRODUCT_DETAIL: "http://localhost:3000/api/products", // + /:id
  PRODUCT_COMMENTS: "http://localhost:3000/api/products", // + /:id/comments

  // Autenticación
  AUTH_REGISTER: "http://localhost:3000/api/auth/register",
  AUTH_LOGIN: "http://localhost:3000/api/auth/login",
  AUTH_LOGOUT: "http://localhost:3000/api/auth/logout",

  // Carrito (requiere autenticación)
  CART: "http://localhost:3000/api/cart",
  CART_ITEMS: "http://localhost:3000/api/cart/items",

  // Órdenes (requiere autenticación)
  ORDERS: "http://localhost:3000/api/orders",

  // Usuarios
  USER_PROFILE: "http://localhost:3000/api/users/profile",
  USER_PUBLIC: "http://localhost:3000/api/users", // + /:username

  // Direcciones de envío (requiere autenticación)
  SHIPPING_ADDRESSES: "http://localhost:3000/api/shipping-addresses",
};

// Utilidades para autenticación JWT
// Estrategia: sessionStorage por defecto (seguro), localStorage solo si "Recordarme"
const AUTH_UTILS = {
  // Guardar token en sessionStorage o localStorage según "recordarme"
  saveToken: (token, remember = false) => {
    if (remember) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("rememberMe", "true");
    } else {
      sessionStorage.setItem("authToken", token);
      localStorage.removeItem("rememberMe");
    }
  },

  // Obtener token (busca en sessionStorage primero, luego localStorage)
  getToken: () => {
    return (
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
    );
  },

  // Eliminar token de ambos storages (logout completo)
  removeToken: () => {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("rememberMe");
  },

  // Verificar si hay sesión activa
  isAuthenticated: () => {
    return !!(
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
    );
  },

  // Verificar si tiene "recordarme" activo
  hasRememberMe: () => {
    return localStorage.getItem("rememberMe") === "true";
  },

  // Headers para peticiones autenticadas
  getAuthHeaders: () => {
    const token = AUTH_UTILS.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  // Guardar datos del usuario en sessionStorage (no persistente)
  saveUserData: (userData) => {
    sessionStorage.setItem("userData", JSON.stringify(userData));
  },

  // Obtener datos del usuario
  getUserData: () => {
    const data = sessionStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  },

  // Eliminar datos del usuario
  clearUserData: () => {
    sessionStorage.removeItem("userData");
  },
};
