/**
 * Funciones utilitarias compartidas
 * Evita duplicación de código en el proyecto
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

/**
 * Obtiene el carrito del localStorage
 * Maneja carritos por usuario y carrito temporal
 * @returns {Array} Array de productos en el carrito
 */
function getCart() {
  const session = getSessionData();

  if (session && session.isLoggedIn) {
    // Usuario logueado: usar carrito personalizado
    const userCartKey = `craftivityCart_${session.usuario}`;
    return JSON.parse(localStorage.getItem(userCartKey)) || [];
  } else {
    // Usuario no logueado: usar carrito temporal
    return JSON.parse(localStorage.getItem("craftivityCart")) || [];
  }
}

/**
 * Guarda el carrito en localStorage
 * Maneja carritos por usuario y carrito temporal
 * @param {Array} cart - Array de productos del carrito
 */
function saveCart(cart) {
  const session = getSessionData();

  if (session && session.isLoggedIn) {
    // Usuario logueado: guardar en carrito personalizado
    const userCartKey = `craftivityCart_${session.usuario}`;
    localStorage.setItem(userCartKey, JSON.stringify(cart));
  } else {
    // Usuario no logueado: guardar en carrito temporal
    localStorage.setItem("craftivityCart", JSON.stringify(cart));
  }
}

/**
 * Migra el carrito temporal al carrito del usuario
 * Se ejecuta cuando un usuario hace login
 * @param {string} username - Nombre del usuario
 */
function migrateCartToUser(username) {
  // Obtener carrito temporal
  const tempCart = JSON.parse(localStorage.getItem("craftivityCart")) || [];

  if (tempCart.length > 0) {
    // Obtener carrito existente del usuario (si tiene)
    const userCartKey = `craftivityCart_${username}`;
    const userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];

    // Combinar carritos (evitar duplicados por ID)
    const combinedCart = [...userCart];

    tempCart.forEach((tempItem) => {
      const existingIndex = combinedCart.findIndex(
        (item) => item.id === tempItem.id
      );
      if (existingIndex >= 0) {
        // Si ya existe, sumar cantidades
        combinedCart[existingIndex].quantity += tempItem.quantity;
      } else {
        // Si no existe, agregar nuevo
        combinedCart.push(tempItem);
      }
    });

    // Guardar carrito combinado
    localStorage.setItem(userCartKey, JSON.stringify(combinedCart));

    // Limpiar carrito temporal
    localStorage.removeItem("craftivityCart");

    console.log(`Carrito migrado para usuario: ${username}`, combinedCart);
  }
}

/**
 * Limpia el carrito temporal al hacer logout
 * Mantiene el carrito del usuario para futuras sesiones
 */
function clearTempCart() {
  localStorage.removeItem("craftivityCart");
}

/**
 * Agrega un producto al carrito
 * @param {Object} product - Producto a agregar
 * @param {number} quantity - Cantidad a agregar (default: 1)
 */
function addToCart(product, quantity = 1) {
  const cart = getCart();

  // Buscar si el producto ya existe en el carrito
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    // Si existe, aumentar cantidad
    cart[existingIndex].quantity += quantity;
  } else {
    // Si no existe, agregar nuevo item
    cart.push({
      id: product.id,
      name: product.name,
      cost: product.cost, // Usar 'cost' para mantener consistencia
      currency: product.currency || "UYU",
      image:
        product.images && product.images[0] ? product.images[0] : product.image,
      quantity: quantity,
      category: product.categoryId || product.category,
    });
  }

  saveCart(cart);

  // Actualizar contador del carrito en la UI
  if (typeof updateCartCounter === "function") {
    updateCartCounter();
  }

  console.log(`Producto agregado al carrito:`, product.name, `x${quantity}`);
  return cart;
}

/**
 * Remueve un producto del carrito
 * @param {number} productId - ID del producto a remover
 */
function removeFromCart(productId) {
  const cart = getCart();
  const filteredCart = cart.filter((item) => item.id !== productId);
  saveCart(filteredCart);

  // Actualizar contador del carrito en la UI
  if (typeof updateCartCounter === "function") {
    updateCartCounter();
  }

  console.log(`Producto removido del carrito:`, productId);
  return filteredCart;
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {number} productId - ID del producto
 * @param {number} newQuantity - Nueva cantidad
 */
function updateCartQuantity(productId, newQuantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex >= 0) {
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menor, remover del carrito
      return removeFromCart(productId);
    } else {
      cart[itemIndex].quantity = newQuantity;
      saveCart(cart);
    }
  }

  // Actualizar contador del carrito en la UI
  if (typeof updateCartCounter === "function") {
    updateCartCounter();
  }

  return cart;
}

/**
 * Obtiene los datos de sesión del localStorage
 * @returns {Object|null} Datos de sesión o null si no existe
 */
function getSessionData() {
  const sessionData = localStorage.getItem("craftivitySession");
  return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * Guarda los datos de sesión en localStorage
 * @param {Object} sessionData - Datos de sesión a guardar
 */
function saveSessionData(sessionData) {
  localStorage.setItem("craftivitySession", JSON.stringify(sessionData));
}

/**
 * Elimina los datos de sesión del localStorage
 */
function clearSessionData() {
  localStorage.removeItem("craftivitySession");
}

/**
 * Muestra un mensaje de notificación temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, info)
 */
function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${
      type === "success"
        ? "var(--success-color)"
        : type === "error"
        ? "var(--danger-color)"
        : "var(--primary-color)"
    };
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  // Agregar al body
  document.body.appendChild(notification);

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ==========================================
// CONFIGURACIÓN FLASH SALES Y DESTACADOS
// ==========================================

/**
 * Cache para datos de promociones (evita múltiples llamadas)
 */
let flashSalesCache = null;
let featuredCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Verifica si un producto tiene flash sale activo
 * @param {number} productId - ID del producto
 * @returns {Promise<boolean>} true si tiene flash sale activo
 */
async function isProductFlashSale(productId) {
  try {
    const flashData = await getFlashSaleData(productId);
    return flashData && flashData.flashSale && flashData.flashSale.active;
  } catch (error) {
    console.log("No se pudo verificar flash sale para producto:", productId);
    return false;
  }
}

/**
 * Obtiene los datos de flash sale de un producto específico
 * @param {number} productId - ID del producto
 * @returns {Promise<Object|null>} Datos del flash sale o null
 */
async function getFlashSaleData(productId) {
  try {
    await loadFlashSalesCache();
    if (!flashSalesCache || !flashSalesCache.products) return null;

    const flashProduct = flashSalesCache.products.find(
      (p) => p.id === parseInt(productId)
    );

    // Verificar que la oferta esté activa y no haya expirado
    if (
      flashProduct &&
      flashProduct.flashSale &&
      flashProduct.flashSale.active
    ) {
      const now = new Date();
      const endDate = new Date(flashProduct.flashSale.endsAt);

      if (endDate > now) {
        return flashProduct;
      }
    }

    return null;
  } catch (error) {
    console.log("Error obteniendo datos de flash sale:", error.message);
    return null;
  }
}

/**
 * Verifica si un producto está marcado como destacado
 * @param {number} productId - ID del producto
 * @returns {Promise<boolean>} true si está destacado
 */
async function isProductFeatured(productId) {
  try {
    const featuredData = await getFeaturedData(productId);
    return featuredData && featuredData.featured === true;
  } catch (error) {
    console.log("No se pudo verificar featured para producto:", productId);
    return false;
  }
}

/**
 * Obtiene los datos de producto destacado
 * @param {number} productId - ID del producto
 * @returns {Promise<Object|null>} Datos del producto destacado o null
 */
async function getFeaturedData(productId) {
  try {
    await loadFeaturedCache();
    if (!featuredCache || !featuredCache.products) return null;

    return (
      featuredCache.products.find((p) => p.id === parseInt(productId)) || null
    );
  } catch (error) {
    console.log("Error obteniendo datos de producto destacado:", error.message);
    return null;
  }
}

/**
 * Carga el cache de flash sales
 * @private
 */
async function loadFlashSalesCache() {
  const now = Date.now();

  // Verificar si el cache es válido
  if (
    flashSalesCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return;
  }

  try {
    const response = await fetch(API_CONFIG.HOT_SALES);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    flashSalesCache = await response.json();
    cacheTimestamp = now;

    console.log("Cache de flash sales actualizado");
  } catch (error) {
    console.error("Error cargando flash sales:", error);
    flashSalesCache = { products: [] };
  }
}

/**
 * Carga el cache de productos destacados
 * @private
 */
async function loadFeaturedCache() {
  const now = Date.now();

  // Verificar si el cache es válido
  if (
    featuredCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return;
  }

  try {
    const response = await fetch(API_CONFIG.FEATURED);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    featuredCache = await response.json();
    if (!cacheTimestamp) cacheTimestamp = now; // Solo actualizar si no se ha hecho antes

    console.log("Cache de productos destacados actualizado");
  } catch (error) {
    console.error("Error cargando productos destacados:", error);
    featuredCache = { products: [] };
  }
}

/**
 * Limpia el cache de promociones para forzar recarga
 */
function clearPromotionsCache() {
  flashSalesCache = null;
  featuredCache = null;
  cacheTimestamp = null;
}

/**
 * Obtiene datos completos de promoción para un producto
 * @param {number} productId - ID del producto
 * @returns {Promise<Object>} Objeto con datos de flash sale y featured
 */
async function getProductPromotionData(productId) {
  const [flashData, featuredData] = await Promise.all([
    getFlashSaleData(productId),
    getFeaturedData(productId),
  ]);

  return {
    flashSale: flashData?.flashSale || { active: false },
    featured: featuredData?.featured || flashData?.featured || false,
    flashPrice: flashData?.flashSale?.price || null,
    originalPrice: flashData?.cost || featuredData?.cost || null,
  };
}
