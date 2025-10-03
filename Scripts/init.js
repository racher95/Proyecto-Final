/**
 * Archivo de Inicialización y configuración global
 * URLs centralizadas de la API y funcionalidades globales
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// URLs de la API (desde configuración centralizada)
const CATEGORIES_URL = API_CONFIG.CATEGORIES;
const PRODUCTS_BASE_URL = API_CONFIG.PRODUCTS_BASE;

// Manejar clics en categorías de la página principal
document.addEventListener("DOMContentLoaded", function () {
  const categoryLinks = document.querySelectorAll(".category-link");
  categoryLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const href = this.getAttribute("data-href");
      if (href) {
        window.location.href = href;
      }
    });
  });
});
