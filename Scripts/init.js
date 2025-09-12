/**
 * Archivo de inicialización y configuración global
 * URLs centralizadas de la API y funcionalidades globales
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// URLs de la nueva API centralizada
const CATEGORIES_URL =
  "https://racher95.github.io/diy-emercado-api/cats/cat.json";
const PRODUCTS_BASE_URL =
  "https://racher95.github.io/diy-emercado-api/cats_products/";

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
