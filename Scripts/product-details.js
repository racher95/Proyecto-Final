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

  // Precio
  const formattedPrice = new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: product.currency || "UYU",
  }).format(product.cost);
  document.getElementById("productPrice").textContent = formattedPrice;

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
    // TODO: Implementar agregar al carrito
    showNotification("Producto agregado al carrito", "success");
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
