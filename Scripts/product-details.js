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
const PRODUCT_DETAIL_BASE_URL =
  "https://racher95.github.io/diy-emercado-api/products/";
const PRODUCT_COMMENTS_BASE_URL =
  "https://racher95.github.io/diy-emercado-api/products_comments/";

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

  // Configurar event listeners
  setupEventListeners();

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
    const response = await fetch(
      "https://racher95.github.io/diy-emercado-api/cats/hot_sales.json"
    );
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
    const response = await fetch(
      "https://racher95.github.io/diy-emercado-api/cats/featured.json"
    );
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
 * Carga los comentarios del producto
 */
async function loadProductComments(productId) {
  try {
    const response = await fetch(
      `${PRODUCT_COMMENTS_BASE_URL}${productId}.json`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const commentsData = await response.json();
    productComments = commentsData || [];

    displayComments();
  } catch (error) {
    console.error("Error loading comments:", error);
    // No mostrar error para comentarios, solo ocultar la sección
    document.getElementById("commentsSection").style.display = "none";
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

  // Botones de acción
  document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (currentProduct) {
      addToCart(currentProduct, 1);
      showNotification(`${currentProduct.name} agregado al carrito`, "success");
    } else {
      showNotification("Error: No se pudo agregar el producto", "error");
    }
  });

  document.getElementById("backToCatalogBtn").addEventListener("click", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("category");

    if (categoryId) {
      window.location.href = `products.html?category=${categoryId}`;
    } else {
      window.location.href = "products.html";
    }
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "products.html";
  });
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

      // Event listeners para navegación del modal
      const modalPrevBtn = document.getElementById("modalPrevBtn");
      const modalNextBtn = document.getElementById("modalNextBtn");

      if (modalPrevBtn) {
        modalPrevBtn.addEventListener("click", () => {
          navigateModalImage(-1);
        });
      }

      if (modalNextBtn) {
        modalNextBtn.addEventListener("click", () => {
          navigateModalImage(1);
        });
      }

      // Event listener para cuando el modal se cierra
      modalElement.addEventListener("hidden.bs.modal", () => {
        console.log("Modal cerrado");
      });

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
