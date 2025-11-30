/**
 * Funciones utilitarias compartidas
 */

function getCart() {
  const isLoggedIn = AUTH_UTILS.isAuthenticated();

  if (isLoggedIn) {
    return [];
  } else {
    return JSON.parse(localStorage.getItem("craftivityCart")) || [];
  }
}

function saveCart(cart) {
  const isLoggedIn = AUTH_UTILS.isAuthenticated();

  if (isLoggedIn) {
    return;
  } else {
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

    localStorage.setItem(userCartKey, JSON.stringify(combinedCart));

    localStorage.removeItem("craftivityCart");
  }
}

function clearTempCart() {
  localStorage.removeItem("craftivityCart");
}

async function addToCart(product, quantity = 1) {
  const token = AUTH_UTILS.getToken();

  if (token) {
    try {
      const response = await fetch(`${API_CONFIG.CART_ITEMS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar al carrito");
      }

      const result = await response.json();

      if (typeof updateCartCounter === "function") {
        updateCartCounter();
      }

      return result;
    } catch (error) {
      console.error("Error agregando al backend:", error);
    }
  }

  const cart = getCart();

  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      cost: product.cost,
      currency: product.currency || "UYU",
      image:
        product.images && product.images[0] ? product.images[0] : product.image,
      quantity: quantity,
      category: product.categoryId || product.category,
    });
  }

  saveCart(cart);

  if (typeof updateCartCounter === "function") {
    updateCartCounter();
  }

  return cart;
}

function removeFromCart(productId) {
  const cart = getCart();
  const filteredCart = cart.filter((item) => item.id !== productId);
  saveCart(filteredCart);

  if (typeof updateCartCounter === "function") {
    updateCartCounter();
  }

  return filteredCart;
}

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

  // Agregar al body
  document.body.appendChild(notification);

  // Mostrar con animación
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remover después de 5 segundos
  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.add("hide");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
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
    if (!cacheTimestamp) cacheTimestamp = now;
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

// ==========================================
// SISTEMA DE PERFILES DE USUARIO
// ==========================================

/**
 * Lee todos los perfiles de usuario desde localStorage
 * @returns {Object} Objeto indexado por username con datos de perfil
 */
function readUsers() {
  try {
    const usersData = localStorage.getItem("craftivityUsers");
    return usersData ? JSON.parse(usersData) : {};
  } catch (error) {
    console.error("Error leyendo perfiles de usuario:", error);
    return {};
  }
}

/**
 * Escribe todos los perfiles de usuario en localStorage
 * @param {Object} users - Objeto con todos los perfiles indexados por username
 */
function writeUsers(users) {
  try {
    localStorage.setItem("craftivityUsers", JSON.stringify(users));
  } catch (error) {
    console.error("Error guardando perfiles de usuario:", error);
    throw new Error("No se pudo guardar el perfil. Espacio insuficiente.");
  }
}

/**
 * Obtiene el perfil de un usuario específico
 * @param {string} username - Nombre de usuario (ej: "Kevin", "Juan")
 * @returns {Object|null} Datos del perfil o null si no existe
 */
function getUserProfile(username) {
  if (!username) return null;
  const users = readUsers();
  return users[username] || null;
}

/**
 * Crea o actualiza el perfil de un usuario
 * @param {string} username - Nombre de usuario (ej: "Kevin", "Juan")
 * @param {Object} patch - Datos a actualizar (parcial)
 * @returns {Object} Perfil actualizado completo
 */
function upsertUserProfile(username, patch) {
  if (!username) {
    throw new Error("Username es requerido");
  }

  const users = readUsers();
  const existingProfile = users[username] || {};
  const now = new Date().toISOString();

  // Crear o actualizar perfil
  const updatedProfile = {
    username: username,
    email: existingProfile.email || "", // Email vacío por defecto
    displayName: existingProfile.displayName || username, // Usar username como displayName inicial
    avatarDataUrl: existingProfile.avatarDataUrl || null,
    avatarFileName: existingProfile.avatarFileName || null,
    avatarSize: existingProfile.avatarSize || null,
    avatarRemoteUrl: existingProfile.avatarRemoteUrl || null,
    avatarHash: existingProfile.avatarHash || null,
    theme: existingProfile.theme || "light",
    createdAt: existingProfile.createdAt || now,
    updatedAt: now,
    ...patch, // Aplicar cambios del patch
  };

  // Guardar en la colección
  users[username] = updatedProfile;
  writeUsers(users);

  return updatedProfile;
}

/**
 * Verifica si un perfil está completo (tiene email y avatar)
 * @param {Object} profile - Objeto de perfil a verificar
 * @returns {boolean} true si el perfil está completo
 */
function isProfileComplete(profile) {
  if (!profile) return false;

  // Validaciones mínimas requeridas
  const hasEmail =
    profile.email && profile.email.trim() !== "" && isValidEmail(profile.email);

  // Verificar avatar en cualquier formato posible
  const hasAvatar =
    (profile.avatar && profile.avatar.startsWith("http")) ||
    (profile.avatarUrl && profile.avatarUrl.startsWith("http")) ||
    (profile.avatar_url && profile.avatar_url.startsWith("http")) ||
    (profile.avatarDataUrl && profile.avatarDataUrl.startsWith("data:image")) ||
    (profile.avatarRemoteUrl && profile.avatarRemoteUrl.startsWith("http"));

  return hasEmail && hasAvatar;
}

/**
 * Lee una imagen desde un archivo y la convierte a DataURL (base64)
 * @param {File} file - Archivo de imagen seleccionado
 * @returns {Promise<Object>} Objeto con { dataUrl, fileName, size }
 */
function readImageAsDataURL(file) {
  return new Promise((resolve, reject) => {
    // Validar que sea un archivo de imagen
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen"));
      return;
    }

    // Validar tamaño máximo: 2MB
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      reject(
        new Error(
          `La imagen es muy grande (${(file.size / 1024 / 1024).toFixed(
            1
          )}MB). Máximo permitido: 2MB`
        )
      );
      return;
    }

    // Leer archivo como DataURL
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve({
        dataUrl: e.target.result,
        fileName: file.name,
        size: file.size,
      });
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo de imagen"));
    };

    reader.readAsDataURL(file);
  });
}

// ==========================================
// SISTEMA DE PEDIDOS (ORDERS)
// ==========================================

/**
 * Crea un objeto de pedido compatible con estructura SQL
 * Preparado para envío futuro a backend
 */
function createOrder(
  cart,
  shippingType,
  address,
  paymentMethod,
  paymentDetails
) {
  const session = checkSession();
  // Calcula subtotal, impuesto y costo de envío para generar el total
  const subtotal = cart.reduce(
    (sum, item) => sum + item.cost * item.quantity,
    0
  );
  const tax = subtotal * CART_CONFIG.TAX_RATE;
  const shippingCost =
    subtotal * CART_CONFIG.SHIPPING_OPTIONS[shippingType].percentage;

  return {
    // Datos principales del pedido (cuando tengamos BD, van a tabla "orders")
    user_id: session.usuario,
    date: new Date().toISOString(),
    subtotal: subtotal,
    tax: tax,
    shipping_cost: shippingCost,
    total: subtotal + tax + shippingCost,
    status: ORDER_STATUS.PENDING,

    // Productos del pedido (van a tabla "order_items" en BD)
    items: cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.cost,
      subtotal: item.cost * item.quantity,
      image: item.image,
    })),

    // Info del envío (dirección y tipo de envío → tabla "order_shipping")
    shipping: {
      type: shippingType,
      type_name: CART_CONFIG.SHIPPING_OPTIONS[shippingType].name,
      department: address.department,
      city: address.city,
      street: address.street,
      number: address.number,
      corner: address.corner,
    },

    // Info del pago (NUNCA guardar CVV ni número completo, solo últimos 4 dígitos)
    payment: {
      method: paymentMethod,
      // Solo si es tarjeta, guardar datos parciales (nunca CVV ni número completo)
      ...(paymentMethod === "credit" && paymentDetails
        ? {
            card_last4: paymentDetails.cardNumber.slice(-4),
            card_holder: paymentDetails.cardHolder,
            card_expiry: paymentDetails.cardExpiry,
          }
        : {}),
    },
  };
}
