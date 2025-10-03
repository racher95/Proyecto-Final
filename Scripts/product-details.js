/**
 * Script para la página de detalles del producto
 * Maneja la carga de información completa, galería de imágenes y comentarios
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Variables globales
let currentProduct = null;
let currentImages = [];
let currentImageIndex = 0;
let productComments = [];

// Variables para el modal de imágenes
let imageModal = null;
let modalImageIndex = 0;

// URLs de la API para detalles y comentarios
const PRODUCT_DETAIL_BASE_URL = API_CONFIG.PRODUCTS_DETAIL;
const PRODUCT_COMMENTS_BASE_URL = API_CONFIG.COMMENTS_BASE;

/**
 * Inicialización cuando carga la página
 */
document.addEventListener("DOMContentLoaded", async function () {
  // Obtener ID del producto desde URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const categoryId = urlParams.get("category");

  if (!productId) {
    showError("No se especificó un producto válido");
    return;
  }

  // Cargar detalles del producto
  await loadProductDetails(productId);

  // Cargar comentarios del producto
  await loadProductComments(productId);

  // Cargar productos relacionados
  await loadRelatedProducts();

  // Configurar event listeners
  setupEventListeners();

  // Inicializar formulario de reseñas
  // Esperar un poco para que el sistema de sesión se inicialice
  setTimeout(initReviewForm, 500);

  // Actualizar breadcrumb si tenemos categoría
  if (categoryId) {
    updateBreadcrumb(categoryId);
  }
});

/**
 * Carga los detalles completos del producto
 */
async function loadProductDetails(productId) {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const productSection = document.getElementById("productDetailSection");

  try {
    // Mostrar loading
    loadingMessage.classList.add("show");
    errorMessage.style.display = "none";
    productSection.style.display = "none";

    // Fetch del producto específico
    const response = await fetch(`${PRODUCT_DETAIL_BASE_URL}${productId}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const productData = await response.json();

    // Cargar datos de promoción
    try {
      const promotionData = await getProductPromotionData(productId);
      productData.flashSale = promotionData.flashSale;
      productData.featured = promotionData.featured;
      productData.flashPrice = promotionData.flashPrice;
      productData.originalPrice =
        promotionData.originalPrice || productData.cost;
    } catch (error) {
      console.log(
        `ℹ️ No se pudieron cargar datos de promoción para producto ${productId}`
      );
      productData.flashSale = { active: false };
      productData.featured = false;
      productData.flashPrice = null;
      productData.originalPrice = productData.cost;
    }

    currentProduct = productData;

    // Procesar imágenes
    currentImages =
      productData.images &&
      Array.isArray(productData.images) &&
      productData.images.length > 0
        ? productData.images
        : [productData.image];

    // Mostrar información del producto
    await displayProductDetails();

    // Inicializar galería de imágenes
    initializeImageGallery();

    // Ocultar loading y mostrar contenido
    loadingMessage.classList.remove("show");
    productSection.style.display = "block";
  } catch (error) {
    console.error("Error loading product details:", error);
    loadingMessage.classList.remove("show");
    showError("Error al cargar los detalles del producto");
  }
}

/**
 * Muestra los detalles del producto en la interfaz
 */
async function displayProductDetails() {
  const product = currentProduct;

  // Título
  document.getElementById("productTitle").textContent = product.name;

  // Verificar si es flash sale y si es producto destacado
  const flashSaleData = await checkFlashSaleStatus(product.id);
  const featuredData = await checkFeaturedStatus(product.id);

  // Mostrar badges
  displayProductBadges(flashSaleData, featuredData);

  // Mostrar precios
  displayProductPricing(product, flashSaleData);

  // Mostrar contador si es flash sale activo
  if (flashSaleData && flashSaleData.isActive) {
    showFlashSaleCountdown(flashSaleData.endsAt);
  } else {
    hideFlashSaleCountdown();
  }

  // Metadata
  document.getElementById(
    "productSold"
  ).textContent = `${product.soldCount} vendidos`;
  document.getElementById("productId").textContent = `#${product.id}`;

  // Categoría
  if (product.category && product.category.name) {
    document.getElementById("productCategory").textContent =
      product.category.name;
  } else {
    document.getElementById("productCategory").textContent = "-";
  }

  // Descripción completa
  document.getElementById("productDescription").textContent =
    product.description;

  // Actualizar breadcrumb
  document.getElementById("productBreadcrumb").textContent = product.name;
}

/**
 * Verifica el estado de flash sale de un producto
 */
async function checkFlashSaleStatus(productId) {
  try {
    const response = await fetch(API_CONFIG.HOT_SALES);
    const flashSalesData = await response.json();

    const flashProduct = flashSalesData.products.find(
      (p) => p.id === productId
    );
    if (!flashProduct) return null;

    const now = new Date();
    const endsAt = new Date(flashProduct.flashSale.endsAt);
    const startsAt = new Date(flashProduct.flashSale.startsAt);

    return {
      isActive: now >= startsAt && now <= endsAt,
      flashPrice: flashProduct.flashPrice,
      originalPrice: flashProduct.cost,
      discount: flashProduct.discount,
      endsAt: flashProduct.flashSale.endsAt,
      startsAt: flashProduct.flashSale.startsAt,
    };
  } catch (error) {
    console.log("No hay datos de flash sale para este producto");
    return null;
  }
}

/**
 * Verifica si un producto es destacado
 */
async function checkFeaturedStatus(productId) {
  try {
    const response = await fetch(API_CONFIG.FEATURED);
    const featuredData = await response.json();

    const featuredProduct = featuredData.products.find(
      (p) => p.id === productId
    );
    return featuredProduct ? { isFeatured: true } : null;
  } catch (error) {
    console.log("No hay datos de productos destacados");
    return null;
  }
}

/**
 * Muestra los badges del producto (destacado, oferta, etc.)
 */
function displayProductBadges(flashSaleData, featuredData) {
  const badgesContainer = document.getElementById("productBadges");
  let badgesHTML = "";

  if (featuredData && featuredData.isFeatured) {
    badgesHTML += `<div class="badge-featured-detail">⭐ Producto Destacado</div>`;
  }

  if (flashSaleData && flashSaleData.isActive) {
    badgesHTML += `<div class="badge-flash-detail">🔥 Oferta Flash -${flashSaleData.discount}%</div>`;
  }

  badgesContainer.innerHTML = badgesHTML;
}

/**
 * Muestra los precios del producto (normal o con oferta)
 */
function displayProductPricing(product, flashSaleData) {
  const normalPricing = document.getElementById("normalPricing");
  const flashPricing = document.getElementById("flashPricing");

  if (flashSaleData && flashSaleData.isActive) {
    // Mostrar precios con oferta
    normalPricing.style.display = "none";
    flashPricing.style.display = "block";

    // Precio original tachado
    document.getElementById("originalPrice").textContent = formatCurrency(
      flashSaleData.originalPrice,
      product.currency
    );
    document.getElementById("originalCurrency").textContent = "";

    // Precio con descuento
    document.getElementById("flashPrice").textContent = formatCurrency(
      flashSaleData.flashPrice,
      product.currency
    );
    document.getElementById("flashCurrency").textContent = "";

    // Badge de descuento
    document.getElementById(
      "discountBadge"
    ).textContent = `-${flashSaleData.discount}%`;
  } else {
    // Mostrar precio normal
    normalPricing.style.display = "block";
    flashPricing.style.display = "none";

    document.getElementById("productPrice").textContent = formatCurrency(
      product.cost,
      product.currency
    );
    document.getElementById("productCurrency").textContent = "";
  }
}

/**
 * Inicializa la galería de imágenes con carrusel
 */
function initializeImageGallery() {
  const mainImage = document.getElementById("mainImage");
  const thumbnailsContainer = document.getElementById("thumbnailsContainer");
  const prevBtn = document.getElementById("prevImageBtn");
  const nextBtn = document.getElementById("nextImageBtn");

  // Configurar imagen principal
  updateMainImage(0);

  // Crear thumbnails
  createThumbnails();

  // Mostrar/ocultar botones de navegación según cantidad de imágenes
  if (currentImages.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
  }

  // Configurar event listeners para el modal DESPUÉS de crear las imágenes
  setupImageModalListeners();

  // Intentar inicializar el modal cuando la galería esté lista
  setTimeout(() => {
    initializeImageModal();
  }, 500);
}

/**
 * Actualiza la imagen principal del carrusel
 */
function updateMainImage(index) {
  currentImageIndex = index;
  const mainImage = document.getElementById("mainImage");

  const imageUrl = currentImages[index].startsWith("http")
    ? currentImages[index]
    : `../${currentImages[index]}`;

  mainImage.src = imageUrl;
  mainImage.alt = currentProduct.name;

  // Actualizar thumbnails activos
  updateThumbnailSelection();
}

/**
 * Crea los thumbnails de la galería
 */
function createThumbnails() {
  const container = document.getElementById("thumbnailsContainer");

  if (currentImages.length <= 1) {
    container.style.display = "none";
    return;
  }

  container.innerHTML = "";

  currentImages.forEach((image, index) => {
    const thumb = document.createElement("img");
    const imageUrl = image.startsWith("http") ? image : `../${image}`;

    thumb.src = imageUrl;
    thumb.alt = `${currentProduct.name} - Imagen ${index + 1}`;
    thumb.className = `thumbnail ${index === 0 ? "active" : ""}`;
    thumb.addEventListener("click", () => updateMainImage(index));

    container.appendChild(thumb);
  });
}

/**
 * Actualiza la selección de thumbnails
 */
function updateThumbnailSelection() {
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentImageIndex);
  });
}

/**
 * Elimina comentarios duplicados del localStorage que ya están en la API
 * Compara por usuario, descripción y score para identificar duplicados
 */
function removeDuplicateComments(localComments, apiComments) {
  return localComments.filter((localComment) => {
    // Buscar si este comentario local ya existe en la API
    const existsInAPI = apiComments.some(
      (apiComment) =>
        apiComment.user === localComment.user &&
        apiComment.description === localComment.description &&
        apiComment.score === localComment.score
    );

    // Mantener solo los que NO están en la API
    return !existsInAPI;
  });
}

/**
 * Carga los comentarios del producto (API + localStorage)
 */
async function loadProductComments(productId) {
  try {
    // 1. Cargar comentarios de la API
    let apiComments = [];
    try {
      const response = await fetch(
        `${PRODUCT_COMMENTS_BASE_URL}${productId}.json`
      );
      if (response.ok) {
        apiComments = await response.json();
      }
    } catch (error) {
      console.log("No hay comentarios en API para este producto");
    }

    // 2. Cargar comentarios de localStorage
    const storageKey = `comments_${productId}`;
    let localComments = [];
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      localComments = JSON.parse(stored);
    }

    // 3. Limpiar duplicados: eliminar de localStorage los que ya están en API
    if (apiComments.length > 0 && localComments.length > 0) {
      const cleanedLocalComments = removeDuplicateComments(
        localComments,
        apiComments
      );

      // Si hay cambios, actualizar localStorage
      if (cleanedLocalComments.length !== localComments.length) {
        if (cleanedLocalComments.length > 0) {
          localStorage.setItem(
            storageKey,
            JSON.stringify(cleanedLocalComments)
          );
        } else {
          localStorage.removeItem(storageKey);
        }
        localComments = cleanedLocalComments;
        console.log("Comentarios locales sincronizados con API");
      }
    }

    // 4. Combinar ambos (ya sin duplicados)
    productComments = [...apiComments, ...localComments];

    // 5. Ordenar por fecha (más recientes primero)
    productComments.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    displayComments();
  } catch (error) {
    console.error("Error loading comments:", error);
    // Si hay error, intentar mostrar solo los locales
    const storageKey = `comments_${productId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      productComments = JSON.parse(stored);
      displayComments();
    } else {
      document.getElementById("commentsSection").style.display = "none";
    }
  }
}

/**
 * Muestra los comentarios en la interfaz
 */
function displayComments() {
  const commentsContainer = document.getElementById("commentsContainer");
  const noComments = document.getElementById("noComments");
  const commentsSection = document.getElementById("commentsSection");

  if (productComments.length === 0) {
    noComments.style.display = "block";
    commentsContainer.innerHTML = "";
  } else {
    noComments.style.display = "none";

    const commentsHTML = productComments
      .map(
        (comment) => `
      <div class="comment">
        <div class="comment-header">
          <div class="comment-user">
            <strong>${comment.user}</strong>
            <div class="comment-rating">
              ${"★".repeat(comment.score)}${"☆".repeat(5 - comment.score)}
            </div>
          </div>
          <div class="comment-date">${new Date(
            comment.dateTime
          ).toLocaleDateString("es-UY")}</div>
        </div>
        <div class="comment-text">
          ${comment.description}
        </div>
      </div>
    `
      )
      .join("");

    commentsContainer.innerHTML = commentsHTML;
  }

  commentsSection.style.display = "block";
}

/**
 * Carga y muestra los productos relacionados en un carousel
 */
async function loadRelatedProducts() {
  const relatedProductsSection = document.getElementById(
    "relatedProductsSection"
  );
  const relatedProductsContainer = document.getElementById(
    "relatedProductsContainer"
  );
  const noRelatedProducts = document.getElementById("noRelatedProducts");
  const carouselPrevBtn = document.getElementById("carouselPrevBtn");
  const carouselNextBtn = document.getElementById("carouselNextBtn");

  // Verificar si el producto tiene productos relacionados
  if (
    !currentProduct ||
    !currentProduct.relatedProducts ||
    currentProduct.relatedProducts.length === 0
  ) {
    // Ocultar toda la sección si no hay productos relacionados
    relatedProductsSection.style.display = "none";
    return;
  }

  // Ocultar mensaje de "no hay productos"
  noRelatedProducts.style.display = "none";

  const products = currentProduct.relatedProducts;

  // Obtener datos de flash sales para verificar ofertas
  let flashSalesData = null;
  try {
    const response = await fetch(API_CONFIG.HOT_SALES);
    if (response.ok) {
      flashSalesData = await response.json();
    }
  } catch (error) {
    console.log("No se pudieron cargar datos de flash sales");
  }

  // Determinar cantidad de productos por slide según el ancho de pantalla
  const getProductsPerSlide = () => {
    if (window.innerWidth >= 1200) return 4; // Desktop grande
    if (window.innerWidth >= 992) return 3; // Desktop
    if (window.innerWidth >= 768) return 2; // Tablet
    return 1; // Mobile
  };

  const productsPerSlide = getProductsPerSlide();

  // Agrupar productos en slides
  const slides = [];
  for (let i = 0; i < products.length; i += productsPerSlide) {
    slides.push(products.slice(i, i + productsPerSlide));
  }

  // Generar HTML para cada slide del carousel
  const carouselHTML = slides
    .map((slideProducts, slideIndex) => {
      const cardsHTML = slideProducts
        .map((product) => {
          const imageUrl = product.image.startsWith("http")
            ? product.image
            : `../${product.image}`;
          const priceFormatted = formatCurrency(product.cost, product.currency);

          // Verificar si el producto está en flash sale
          let isFlashSale = false;
          let flashDiscount = 0;
          if (flashSalesData && flashSalesData.products) {
            const flashProduct = flashSalesData.products.find(
              (p) => p.id === product.id
            );
            if (flashProduct && flashProduct.flashSale) {
              const now = new Date();
              const endsAt = new Date(flashProduct.flashSale.endsAt);
              const startsAt = new Date(flashProduct.flashSale.startsAt);
              isFlashSale = now >= startsAt && now <= endsAt;
              flashDiscount = flashProduct.discount || 0;
            }
          }

          // Generar badges
          let badgesHTML = "";
          if (product.featured) {
            badgesHTML +=
              '<span class="related-badge-featured">⭐ Destacado</span>';
          }
          if (isFlashSale) {
            badgesHTML += `<span class="related-badge-flash">🔥 -${flashDiscount}%</span>`;
          }

          return `
            <div class="col">
              <div class="related-product-card" data-product-id="${product.id}">
                <div class="related-product-image">
                  <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                  ${badgesHTML}
                </div>
                <div class="related-product-info">
                  <h3 class="related-product-name">${product.name}</h3>
                  <p class="related-product-category">${product.category}</p>
                  <div class="related-product-price">
                    <span class="price">${priceFormatted}</span>
                  </div>
                  <button class="btn-view-related" data-product-id="${product.id}">
                    Ver Producto →
                  </button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="carousel-item ${slideIndex === 0 ? "active" : ""}">
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            ${cardsHTML}
          </div>
        </div>
      `;
    })
    .join("");

  // Insertar HTML en el contenedor
  relatedProductsContainer.innerHTML = carouselHTML;

  // Mostrar/ocultar controles del carousel según la cantidad de slides
  if (slides.length > 1) {
    carouselPrevBtn.style.display = "flex";
    carouselNextBtn.style.display = "flex";
  } else {
    carouselPrevBtn.style.display = "none";
    carouselNextBtn.style.display = "none";
  }

  // Agregar event listeners a los botones "Ver Producto"
  const viewButtons =
    relatedProductsContainer.querySelectorAll(".btn-view-related");
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      navigateToRelatedProduct(productId);
    });
  });

  // Mostrar la sección
  relatedProductsSection.style.display = "block";

  // Actualizar carousel en resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      loadRelatedProducts();
    }, 250);
  });
}

/**
 * Navega a un producto relacionado manteniendo la categoría
 */
function navigateToRelatedProduct(productId) {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("category");

  // Construir URL con categoría si existe
  let newUrl = `product-details.html?id=${productId}`;
  if (categoryId) {
    newUrl += `&category=${categoryId}`;
  }

  // Navegar al nuevo producto
  window.location.href = newUrl;
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Navegación de imágenes - Asegurar que no haya duplicados
  const prevBtn = document.getElementById("prevImageBtn");
  const nextBtn = document.getElementById("nextImageBtn");

  if (prevBtn) {
    // Remover listeners anteriores
    prevBtn.removeEventListener("click", prevImageHandler);
    // Agregar nuevo listener
    prevBtn.addEventListener("click", prevImageHandler);
  }

  if (nextBtn) {
    // Remover listeners anteriores
    nextBtn.removeEventListener("click", nextImageHandler);
    // Agregar nuevo listener
    nextBtn.addEventListener("click", nextImageHandler);
  }

  // Botones de acción - Con cleanup para prevenir duplicados
  const addToCartBtn = document.getElementById("addToCartBtn");
  const backToCatalogBtn = document.getElementById("backToCatalogBtn");
  const backBtn = document.getElementById("backBtn");

  if (addToCartBtn) {
    addToCartBtn.removeEventListener("click", addToCartHandler);
    addToCartBtn.addEventListener("click", addToCartHandler);
  }

  if (backToCatalogBtn) {
    backToCatalogBtn.removeEventListener("click", backToCatalogHandler);
    backToCatalogBtn.addEventListener("click", backToCatalogHandler);
  }

  if (backBtn) {
    backBtn.removeEventListener("click", backButtonHandler);
    backBtn.addEventListener("click", backButtonHandler);
  }
}

/**
 * Handler para agregar al carrito
 */
function addToCartHandler() {
  if (currentProduct) {
    addToCart(currentProduct, 1);
    showNotification(`${currentProduct.name} agregado al carrito`, "success");
  } else {
    showNotification("Error: No se pudo agregar el producto", "error");
  }
}

/**
 * Handler para volver al catálogo
 */
function backToCatalogHandler() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get("category");

  if (categoryId) {
    window.location.href = `products.html?category=${categoryId}`;
  } else {
    window.location.href = "products.html";
  }
}

/**
 * Handler para botón atrás
 */
function backButtonHandler() {
  window.location.href = "products.html";
}

/**
 * Actualiza el breadcrumb con información de categoría
 */
async function updateBreadcrumb(categoryId) {
  try {
    const response = await fetch(CATEGORIES_URL);
    if (response.ok) {
      const categories = await response.json();
      const category = categories.find((cat) => cat.id == categoryId);

      if (category) {
        const breadcrumb = document.getElementById("categoryBreadcrumb");
        breadcrumb.textContent = category.name;
        breadcrumb.href = `products.html?category=${categoryId}`;
      }
    }
  } catch (error) {
    console.error("Error loading category for breadcrumb:", error);
  }
}

/**
 * Muestra mensaje de error
 */
function showError(message) {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const productSection = document.getElementById("productDetailSection");

  loadingMessage.classList.remove("show");
  productSection.style.display = "none";
  errorMessage.style.display = "block";

  const errorText = errorMessage.querySelector("p");
  if (errorText) {
    errorText.textContent = message;
  }
}

/**
 * Muestra el contador de flash sale
 * @param {string} endTime - Fecha de fin de la promoción
 */
function showFlashSaleCountdown(endTime) {
  const countdownContainer = document.getElementById("flashSaleCountdown");
  if (!countdownContainer) return;

  countdownContainer.style.display = "block";

  // Iniciar contador
  updateCountdown(endTime);

  // Actualizar cada segundo
  const countdownInterval = setInterval(() => {
    const timeLeft = updateCountdown(endTime);
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      hideFlashSaleCountdown();
    }
  }, 1000);
}

/**
 * Oculta el contador de flash sale
 */
function hideFlashSaleCountdown() {
  const countdownContainer = document.getElementById("flashSaleCountdown");
  if (countdownContainer) {
    countdownContainer.style.display = "none";
  }
}

/**
 * Actualiza los valores del contador
 * @param {string} endTime - Fecha de fin de la promoción
 * @returns {number} Tiempo restante en milisegundos
 */
function updateCountdown(endTime) {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const timeLeft = end - now;

  if (timeLeft <= 0) {
    document.getElementById("countdownDays").textContent = "00";
    document.getElementById("countdownHours").textContent = "00";
    document.getElementById("countdownMinutes").textContent = "00";
    document.getElementById("countdownSeconds").textContent = "00";
    return 0;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  document.getElementById("countdownDays").textContent = days
    .toString()
    .padStart(2, "0");
  document.getElementById("countdownHours").textContent = hours
    .toString()
    .padStart(2, "0");
  document.getElementById("countdownMinutes").textContent = minutes
    .toString()
    .padStart(2, "0");
  document.getElementById("countdownSeconds").textContent = seconds
    .toString()
    .padStart(2, "0");

  return timeLeft;
}

/**
 * Inicializa el modal de imágenes
 */
function initializeImageModal() {
  // Verificar que Bootstrap esté disponible
  if (typeof bootstrap === "undefined") {
    console.log("Bootstrap aún no está disponible, esperando...");
    return false;
  }

  // Inicializar modal de Bootstrap
  const modalElement = document.getElementById("imageModal");
  if (modalElement) {
    try {
      imageModal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true,
      });

      // Event listeners para navegación del modal - Con cleanup
      const modalPrevBtn = document.getElementById("modalPrevBtn");
      const modalNextBtn = document.getElementById("modalNextBtn");

      if (modalPrevBtn) {
        modalPrevBtn.removeEventListener("click", modalPrevHandler);
        modalPrevBtn.addEventListener("click", modalPrevHandler);
      }

      if (modalNextBtn) {
        modalNextBtn.removeEventListener("click", modalNextHandler);
        modalNextBtn.addEventListener("click", modalNextHandler);
      }

      // Event listener para cuando el modal se cierra
      modalElement.removeEventListener("hidden.bs.modal", modalHiddenHandler);
      modalElement.addEventListener("hidden.bs.modal", modalHiddenHandler);

      console.log("Modal inicializado correctamente");
      return true;
    } catch (error) {
      console.error("Error inicializando modal:", error);
      return false;
    }
  } else {
    console.error("Elemento modal no encontrado");
    return false;
  }
}

/**
 * Handler para botón anterior del modal
 */
function modalPrevHandler() {
  navigateModalImage(-1);
}

/**
 * Handler para botón siguiente del modal
 */
function modalNextHandler() {
  navigateModalImage(1);
}

/**
 * Handler para cuando el modal se oculta
 */
function modalHiddenHandler() {
  console.log("Modal cerrado");
}

/**
 * Abre el modal con una imagen específica
 * @param {number} imageIndex - Índice de la imagen a mostrar
 */
function openImageModal(imageIndex) {
  console.log("Intentando abrir modal con imagen:", imageIndex);

  if (!imageModal) {
    console.log("Modal no inicializado, intentando inicializar...");
    if (!initializeImageModal()) {
      console.log("No se pudo inicializar el modal");
      return;
    }
  }

  if (!currentImages || currentImages.length === 0) {
    console.error("No hay imágenes disponibles");
    return;
  }

  modalImageIndex = imageIndex;
  updateModalImage();

  try {
    imageModal.show();
    console.log("Modal abierto exitosamente");
  } catch (error) {
    console.error("Error abriendo modal:", error);
  }
}

/**
 * Actualiza la imagen mostrada en el modal
 */
function updateModalImage() {
  const modalImage = document.getElementById("modalImage");
  const currentImageNumber = document.getElementById("currentImageNumber");
  const totalImages = document.getElementById("totalImages");
  const modalTitle = document.getElementById("imageModalLabel");

  if (modalImage && currentImages.length > 0) {
    const imageUrl = currentImages[modalImageIndex].startsWith("http")
      ? currentImages[modalImageIndex]
      : `../${currentImages[modalImageIndex]}`;

    modalImage.src = imageUrl;
    modalImage.alt = `${currentProduct.name} - Imagen ${modalImageIndex + 1}`;

    // Actualizar contador
    currentImageNumber.textContent = modalImageIndex + 1;
    totalImages.textContent = currentImages.length;

    // Actualizar título del modal
    modalTitle.textContent = `${currentProduct.name} - Imagen ${
      modalImageIndex + 1
    }`;
  }

  // Mostrar/ocultar botones de navegación
  const prevBtn = document.getElementById("modalPrevBtn");
  const nextBtn = document.getElementById("modalNextBtn");

  if (currentImages.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
  }
}

/**
 * Navega a la siguiente o anterior imagen en el modal
 * @param {number} direction - 1 para siguiente, -1 para anterior
 */
function navigateModalImage(direction) {
  const newIndex = modalImageIndex + direction;

  if (newIndex >= 0 && newIndex < currentImages.length) {
    modalImageIndex = newIndex;
  } else if (newIndex < 0) {
    modalImageIndex = currentImages.length - 1; // Ir al final
  } else {
    modalImageIndex = 0; // Ir al inicio
  }

  updateModalImage();
}

/**
 * Agrega event listeners para abrir el modal al hacer click en las imágenes
 */
function setupImageModalListeners() {
  // Click en imagen principal
  const mainImage = document.getElementById("mainImage");
  if (mainImage) {
    mainImage.style.cursor = "pointer";
    mainImage.title = "Click para ver en grande";

    // Remover event listener anterior si existe
    mainImage.removeEventListener("click", openImageModalHandler);
    // Agregar nuevo event listener
    mainImage.addEventListener("click", openImageModalHandler);
  }
}

/**
 * Handler para abrir el modal con la imagen actual
 */
function openImageModalHandler() {
  openImageModal(currentImageIndex);
}

/**
 * Inicializa el formulario de reseñas
 * Usa el sistema de sesión existente (checkSession de main.js)
 */
function initReviewForm() {
  console.log("Inicializando formulario de reseñas...");

  const reviewFormSection = document.getElementById("reviewFormSection");
  const reviewForm = document.getElementById("reviewForm");
  const loginRequired = document.getElementById("loginRequired");

  if (!reviewFormSection) {
    console.error("No se encontró la sección del formulario de reseñas");
    return;
  }

  // Usar checkSession() del sistema existente (main.js)
  const sessionData =
    typeof checkSession === "function" ? checkSession() : null;
  console.log("Datos de sesión:", sessionData);

  if (!sessionData || !sessionData.isLoggedIn) {
    // Usuario no logueado - mostrar mensaje
    console.log("Usuario no logueado, mostrando mensaje de login");
    if (loginRequired) loginRequired.style.display = "block";
    if (reviewForm) reviewForm.style.display = "none";
  } else {
    // Usuario logueado - mostrar formulario
    console.log("Usuario logueado:", sessionData.usuario);
    if (loginRequired) loginRequired.style.display = "none";
    if (reviewForm) reviewForm.style.display = "block";

    // Inicializar estrellas interactivas
    initStarRating();

    // Inicializar contador de caracteres
    initCharCounter();

    // Setup form submit
    reviewForm.addEventListener("submit", handleReviewSubmit);

    // Botón cancelar
    const cancelBtn = document.getElementById("cancelReviewBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", resetReviewForm);
    }
  }

  // Mostrar la sección
  reviewFormSection.style.display = "block";
  console.log("Formulario de reseñas inicializado correctamente");
}

/**
 * Inicializa el sistema de calificación con estrellas
 */
function initStarRating() {
  const stars = document.querySelectorAll("#starRating i");
  const ratingInput = document.getElementById("ratingValue");
  let selectedRating = 0;

  stars.forEach((star, index) => {
    // Hover effect
    star.addEventListener("mouseenter", () => {
      updateStarDisplay(index + 1, false);
    });

    // Click para seleccionar
    star.addEventListener("click", () => {
      selectedRating = index + 1;
      ratingInput.value = selectedRating;
      updateStarDisplay(selectedRating, true);

      // Ocultar error si había
      const ratingError = document.getElementById("ratingError");
      if (ratingError) {
        ratingError.classList.remove("d-block");
        ratingError.classList.add("d-none");
      }
    });
  });

  // Restaurar al salir del hover
  const starRating = document.getElementById("starRating");
  starRating.addEventListener("mouseleave", () => {
    updateStarDisplay(selectedRating, true);
  });
}

/**
 * Actualiza la visualización de las estrellas
 */
function updateStarDisplay(rating, isSelected) {
  const stars = document.querySelectorAll("#starRating i");

  stars.forEach((star, index) => {
    star.classList.remove("fas", "far", "selected", "hover");

    if (index < rating) {
      if (isSelected) {
        star.classList.add("fas", "selected");
      } else {
        star.classList.add("fas", "hover");
      }
    } else {
      star.classList.add("far");
    }
  });
}

/**
 * Inicializa el contador de caracteres
 */
function initCharCounter() {
  const reviewText = document.getElementById("reviewText");
  const charCount = document.getElementById("charCount");

  reviewText.addEventListener("input", () => {
    const count = reviewText.value.length;
    charCount.textContent = `${count}/500`;

    // Cambiar color si se acerca al límite
    if (count > 450) {
      charCount.style.color = "#dc3545";
    } else if (count > 400) {
      charCount.style.color = "#ffc107";
    } else {
      charCount.style.color = "#6c757d";
    }
  });
}

/**
 * Maneja el envío del formulario de reseña
 */
async function handleReviewSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const ratingValue = document.getElementById("ratingValue").value;
  const reviewText = document.getElementById("reviewText").value.trim();
  const ratingError = document.getElementById("ratingError");

  // Obtener datos de sesión para el nombre de usuario
  const sessionData =
    typeof checkSession === "function" ? checkSession() : null;
  const username =
    sessionData && sessionData.usuario ? sessionData.usuario : "Usuario";

  // Validar rating
  if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
    ratingError.classList.remove("d-none");
    ratingError.classList.add("d-block");
    return;
  } else {
    ratingError.classList.remove("d-block");
    ratingError.classList.add("d-none");
  }

  // Validar texto
  if (reviewText.length < 10 || reviewText.length > 500) {
    document.getElementById("reviewText").classList.add("is-invalid");
    return;
  }

  // Crear objeto de comentario (username ya obtenido arriba)
  const newComment = {
    product: currentProduct.id,
    score: parseInt(ratingValue),
    description: reviewText,
    user: username,
    dateTime: new Date().toISOString().replace("T", " ").substring(0, 19),
  };

  try {
    // 1. Guardar en localStorage (inmediato)
    saveCommentToLocalStorage(newComment);

    // 2. Agregar a la lista visual inmediatamente
    addCommentToDisplay(newComment);

    // 3. Sincronizar con la API en background
    syncCommentToAPI(newComment).catch((err) => {
      console.warn(
        "No se pudo sincronizar con la API, guardado solo localmente:",
        err
      );
    });

    // 4. Resetear formulario
    resetReviewForm();

    // 5. Mostrar notificación de éxito
    showNotification("¡Reseña publicada correctamente!", "success");

    // 6. Scroll a la sección de comentarios
    document.getElementById("commentsSection").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("Error al guardar reseña:", error);
    showNotification(
      "Error al publicar la reseña. Intenta nuevamente.",
      "error"
    );
  }
}

/**
 * Sincroniza el comentario con la API a través del Cloudflare Worker
 */
async function syncCommentToAPI(comment) {
  const workerUrl = API_CONFIG.COMMENTS_WORKER + "/sync-comment";

  console.log("Sincronizando comentario con la API...");

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: comment.product.toString(),
        comment: comment,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Worker returned ${response.status}`);
    }

    const result = await response.json();
    console.log("Comentario sincronizado con la API:", result);
    return result;
  } catch (error) {
    console.error("Error al sincronizar con la API:", error);
    throw error;
  }
}

/**
 * Guarda un comentario en localStorage
 */
function saveCommentToLocalStorage(comment) {
  const storageKey = `comments_${currentProduct.id}`;

  // Obtener comentarios existentes
  let localComments = [];
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    localComments = JSON.parse(stored);
  }

  // Agregar nuevo comentario
  localComments.push(comment);

  // Guardar de vuelta
  localStorage.setItem(storageKey, JSON.stringify(localComments));
}

/**
 * Agrega un comentario a la visualización
 */
function addCommentToDisplay(comment) {
  const commentsContainer = document.getElementById("commentsContainer");
  const noComments = document.getElementById("noComments");

  // Ocultar mensaje de "no hay comentarios"
  noComments.style.display = "none";

  // Crear HTML del comentario
  const commentHTML = `
    <div class="comment new-comment">
      <div class="comment-header">
        <div class="comment-user">
          <strong>${comment.user}</strong>
          <div class="comment-rating">
            ${"★".repeat(comment.score)}${"☆".repeat(5 - comment.score)}
          </div>
        </div>
        <div class="comment-date">
          ${new Date(comment.dateTime).toLocaleDateString("es-UY")}
          <span class="badge bg-success ms-2">Nueva</span>
        </div>
      </div>
      <div class="comment-text">
        ${comment.description}
      </div>
    </div>
  `;

  // Agregar al inicio de la lista
  commentsContainer.insertAdjacentHTML("afterbegin", commentHTML);

  // Animar el nuevo comentario
  setTimeout(() => {
    const newComment = commentsContainer.querySelector(".new-comment");
    if (newComment) {
      newComment.style.animation = "slideIn 0.5s ease";
    }
  }, 100);
}

/**
 * Resetea el formulario de reseña
 */
function resetReviewForm() {
  const form = document.getElementById("reviewForm");
  form.reset();

  // Resetear estrellas
  const stars = document.querySelectorAll("#starRating i");
  stars.forEach((star) => {
    star.classList.remove("fas", "selected", "hover");
    star.classList.add("far");
  });

  // Resetear rating value
  document.getElementById("ratingValue").value = "";

  // Resetear contador de caracteres
  document.getElementById("charCount").textContent = "0/500";
  document.getElementById("charCount").style.color = "#6c757d";

  // Ocultar errores
  const ratingError = document.getElementById("ratingError");
  if (ratingError) {
    ratingError.classList.remove("d-block");
    ratingError.classList.add("d-none");
  }
  document.getElementById("reviewText").classList.remove("is-invalid");
}

/**
 * Handler para imagen anterior
 */
function prevImageHandler() {
  const newIndex =
    currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1;
  updateMainImage(newIndex);
}

/**
 * Handler para imagen siguiente
 */
function nextImageHandler() {
  const newIndex =
    currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0;
  updateMainImage(newIndex);
}
