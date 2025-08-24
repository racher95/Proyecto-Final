/**
 * Funciones utilitarias compartidas
 * Evita duplicación de código en el proyecto
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

/**
 * Obtiene el carrito del localStorage
 * @returns {Array} Array de productos en el carrito
 */
function getCart() {
  return JSON.parse(localStorage.getItem("craftivityCart")) || [];
}

/**
 * Guarda el carrito en localStorage
 * @param {Array} cart - Array de productos del carrito
 */
function saveCart(cart) {
  localStorage.setItem("craftivityCart", JSON.stringify(cart));
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
 * Formatea un precio con el símbolo de pesos uruguayos
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(price) {
  return `$U ${price.toLocaleString()}`;
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

/**
 * Valida si una cadena es un email válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
