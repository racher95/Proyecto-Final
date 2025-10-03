/**
 * ========================================
 * COMPONENT LOADER
 * ========================================
 *
 * Sistema de carga dinámica de componentes HTML reutilizables.
 * Permite cargar header y footer desde archivos separados, eliminando
 * la duplicación de ~2,500 LOC en 7 archivos HTML.
 *
 * Características:
 * - Carga asíncrona de componentes
 * - Resolución automática de rutas (root vs subfolder)
 * - Reemplazo de placeholders {{baseUrl}}
 * - Manejo de errores robusto
 */

(function () {
  "use strict";

  /**
   * Determina la ruta base según la ubicación actual
   * @returns {string} - Ruta base vacía para root, '../' para subfolders
   */
  function getBaseUrl() {
    const path = window.location.pathname;

    // Si estamos en una subcarpeta (pages/), necesitamos '../'
    if (path.includes("/pages/")) {
      return "../";
    }

    // Si estamos en la raíz, la ruta base es vacía
    return "";
  }

  /**
   * Carga un componente HTML desde un archivo externo
   * @param {string} componentPath - Ruta al archivo del componente
   * @param {string} targetSelector - Selector CSS del contenedor donde insertar
   * @returns {Promise<void>}
   */
  async function loadComponent(componentPath, targetSelector) {
    try {
      const baseUrl = getBaseUrl();
      const fullPath = `${baseUrl}${componentPath}`;

      // Fetch del componente
      const response = await fetch(fullPath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let html = await response.text();

      // Reemplazar placeholders {{baseUrl}} con la ruta base real
      html = html.replace(/\{\{baseUrl\}\}/g, baseUrl);

      // Insertar en el DOM
      const target = document.querySelector(targetSelector);

      if (!target) {
        console.warn(`Target element not found: ${targetSelector}`);
        return;
      }

      target.innerHTML = html;

      console.log(`✓ Component loaded: ${componentPath}`);
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error);
      // No lanzar error para no romper el resto de la página
    }
  }

  /**
   * Carga todos los componentes de la página
   */
  async function loadAllComponents() {
    // Array de promesas para cargar en paralelo
    const loadPromises = [];

    // Cargar header si existe el contenedor
    if (document.querySelector("#header-placeholder")) {
      loadPromises.push(
        loadComponent("components/header.html", "#header-placeholder")
      );
    }

    // Cargar footer si existe el contenedor
    if (document.querySelector("#footer-placeholder")) {
      loadPromises.push(
        loadComponent("components/footer.html", "#footer-placeholder")
      );
    }

    // Esperar a que todos los componentes se carguen
    await Promise.all(loadPromises);

    // Disparar evento personalizado cuando todos los componentes estén listos
    document.dispatchEvent(new CustomEvent("componentsLoaded"));

    console.log("✓ All components loaded successfully");
  }

  /**
   * Inicializar la carga de componentes cuando el DOM esté listo
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAllComponents);
  } else {
    // El DOM ya está cargado
    loadAllComponents();
  }
})();
