/**
 * Carga dinámica de componentes reutilizables (header y footer)
 */

(function () {
  "use strict";

  function getBaseUrl() {
    const path = window.location.pathname;
    if (path.includes("/pages/")) {
      return "../";
    }
    return "";
  }

  async function loadComponent(componentPath, targetSelector) {
    try {
      const baseUrl = getBaseUrl();
      const fullPath = `${baseUrl}${componentPath}`;

      const response = await fetch(fullPath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let html = await response.text();
      html = html.replace(/\{\{baseUrl\}\}/g, baseUrl);

      const target = document.querySelector(targetSelector);

      if (!target) {
        console.warn(`Elemento no encontrado: ${targetSelector}`);
        return;
      }

      target.innerHTML = html;
    } catch (error) {
      console.error(`Error cargando componente ${componentPath}:`, error);
    }
  }

  async function loadAllComponents() {
    const loadPromises = [];

    if (document.querySelector("#header-placeholder")) {
      loadPromises.push(
        loadComponent("components/header.html", "#header-placeholder")
      );
    }

    if (document.querySelector("#footer-placeholder")) {
      loadPromises.push(
        loadComponent("components/footer.html", "#footer-placeholder")
      );
    }

    await Promise.all(loadPromises);

    document.dispatchEvent(new CustomEvent("componentsLoaded"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAllComponents);
  } else {
    loadAllComponents();
  }
})();
