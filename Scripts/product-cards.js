/**
 * Sistema Universal de Tarjetas de Producto
 * Funciones compartidas para crear tarjetas consistentes en toda la aplicación
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

/**
 * Crea una tarjeta de producto universal - versión limpia y optimizada
 * @param {Object} product - Datos del producto
 * @param {string} context - Contexto: 'flash-sale', 'featured', 'catalog'
 * @returns {HTMLElement} Elemento de la tarjeta
 */
function createUniversalProductCard(product, context = "catalog") {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.productId = product.id;

  // Determinar si es flash sale activo
  const isFlashSale =
    product.flashSale &&
    product.flashSale.active &&
    new Date(product.flashSale.endsAt) > new Date();

  // Agregar clases según contexto
  if (context === "flash-sale") card.classList.add("flash-sale-card");
  if (context === "featured") card.classList.add("featured-card");

  // Determinar imagen
  const images = product.images || [product.image];
  const imageUrl = images[0]?.startsWith("http")
    ? images[0]
    : `img/${images[0]}`;

  // Crear estructura HTML
  card.innerHTML = `
    <div class="product-image-container">
      <img src="${imageUrl}" alt="${product.name}" class="product-image"
           onclick="navigateToProduct(${product.id})" />
      ${renderProductBadges(product, isFlashSale)}
    </div>
    <div class="product-info">
      <h3 class="product-name" onclick="navigateToProduct(${product.id})">${
    product.name
  }</h3>
      <p class="product-description">${product.description}</p>
      ${renderProductPricing(product, isFlashSale)}
      ${
        isFlashSale
          ? renderProductCountdown(product.flashSale.endsAt, product.id)
          : ""
      }
      <div class="product-footer">
        <div class="product-meta">
          <span class="product-sold">${product.soldCount} vendidos</span>
          <span class="product-id">ID: ${product.id}</span>
        </div>
        <button onclick="navigateToProduct(${
          product.id
        })" class="btn btn-primary">
          ${getButtonText(context)}
        </button>
      </div>
    </div>
  `;

  return card;
}

/**
 * Renderiza badges de producto
 * @param {Object} product - Datos del producto
 * @param {boolean} isFlashSale - Si es flash sale activo
 * @returns {string} HTML de badges
 */
function renderProductBadges(product, isFlashSale) {
  let badges = "";

  if (isFlashSale) {
    const discount = Math.round(
      ((product.cost - product.flashSale.price) / product.cost) * 100
    );
    badges += `<div class="flash-badge">⚡ -${discount}%</div>`;
  }

  if (product.featured) {
    badges += `<div class="featured-badge">⭐ DESTACADO</div>`;
  }

  return badges;
}

/**
 * Renderiza pricing de producto
 * @param {Object} product - Datos del producto
 * @param {boolean} isFlashSale - Si es flash sale activo
 * @returns {string} HTML de pricing
 */
function renderProductPricing(product, isFlashSale) {
  if (isFlashSale) {
    const originalPrice = formatCurrency(product.cost, product.currency);
    const flashPrice = formatCurrency(
      product.flashSale.price,
      product.currency
    );

    return `
      <div class="product-pricing flash-pricing">
        <div class="original-price">${originalPrice}</div>
        <div class="flash-price">${flashPrice}</div>
      </div>
    `;
  } else {
    const price = formatCurrency(product.cost, product.currency);
    return `<div class="product-pricing"><div class="product-price">${price}</div></div>`;
  }
}

/**
 * Renderiza countdown timer
 * @param {string} endDate - Fecha de fin
 * @param {number} productId - ID del producto
 * @returns {string} HTML del countdown
 */
function renderProductCountdown(endDate, productId) {
  return `
    <div class="countdown-container" id="countdown-${productId}">
      <span class="countdown-label">⏰ Termina en:</span>
      <span class="countdown-timer" data-end="${endDate}" data-product-id="${productId}">Calculando...</span>
    </div>
  `;
}

/**
 * Obtiene el texto del botón según el contexto
 * @param {string} context - Contexto de la tarjeta
 * @returns {string} Texto del botón
 */
function getButtonText(context) {
  const buttonTexts = {
    "flash-sale": "¡Aprovechar!",
    featured: "Ver Detalles",
    catalog: "Ver Detalles",
  };
  return buttonTexts[context] || "Ver Detalles";
}

/**
 * Navega a página de producto
 * @param {number} productId - ID del producto
 */
function navigateToProduct(productId) {
  // Detectar si estamos en la página raíz o en una subpágina
  const currentPath = window.location.pathname;
  const basePath = currentPath.includes("/pages/") ? "./" : "pages/";

  window.location.href = `${basePath}product-details.html?id=${productId}`;
}

/**
 * Formatea cantidad como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount, currency = "UYU") {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
