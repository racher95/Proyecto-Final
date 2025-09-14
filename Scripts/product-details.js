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
    displayProductDetails();

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
function displayProductDetails() {
  const product = currentProduct;

  // Título
  document.getElementById("productTitle").textContent = product.name;

  // Verificar si es flash sale activo
  const isFlashSale =
    product.flashSale &&
    product.flashSale.active &&
    new Date(product.flashSale.endsAt) > new Date();

  // Precio
  if (isFlashSale && product.flashPrice) {
    // Mostrar precio con descuento
    const formattedFlashPrice = new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: product.currency || "UYU",
    }).format(product.flashPrice);

    const formattedOriginalPrice = new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: product.currency || "UYU",
    }).format(product.originalPrice);

    document.getElementById("productPrice").innerHTML = `
      <span class="flash-price">${formattedFlashPrice}</span>
      <span class="original-price">${formattedOriginalPrice}</span>
    `;

    // Mostrar contador de flash sale
    showFlashSaleCountdown(product.flashSale.endsAt);
  } else {
    // Precio normal
    const formattedPrice = new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: product.currency || "UYU",
    }).format(product.cost);
    document.getElementById("productPrice").textContent = formattedPrice;

    // Ocultar contador si existe
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
  // Navegación de imágenes
  document.getElementById("prevImageBtn").addEventListener("click", () => {
    const newIndex =
      currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1;
    updateMainImage(newIndex);
  });

  document.getElementById("nextImageBtn").addEventListener("click", () => {
    const newIndex =
      currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0;
    updateMainImage(newIndex);
  });

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
