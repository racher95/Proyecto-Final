/**
 * Gestión del catálogo de productos de Craftivity
 * Maneja la carga desde API, filtrado, búsqueda y carrito
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 *
 * Nota: Las funciones showNotification() y updateCartCounter() están
 * centralizadas en main.js para evitar duplicación de código.
 */

// Variables globales para manejar los productos
let allProducts = []; // Todos los productos cargados desde la API
let filteredProducts = []; // Productos filtrados por búsqueda

// URL de la API - uso categoría 101 (autos)
const PRODUCTS_API_URL =
  "https://japceibal.github.io/emercado-api/cats_products/101.json";

/**
 * Carga los productos desde la API externa
 * Maneja estados de carga, errores y éxito
 */
async function loadProducts() {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const productsContainer = document.getElementById("productsContainer");

  try {
    // Muestro el loading
    if (loadingMessage) loadingMessage.classList.add("show");
    if (errorMessage) errorMessage.classList.remove("show");
    if (productsContainer) productsContainer.innerHTML = "";

    // Fetch de la API
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    allProducts = data.products || [];

    // Aplicar filtro de URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");

    let productsToShow = allProducts;
    if (searchTerm) {
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = searchTerm;

      productsToShow = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Renderizar productos
    displayProducts(productsToShow);

    // Ocultar loading después del render
    if (loadingMessage) loadingMessage.classList.remove("show");
  } catch (error) {
    console.error("Error loading products:", error);
    if (loadingMessage) loadingMessage.classList.remove("show");
    if (errorMessage) {
      errorMessage.classList.add("show");
      errorMessage.textContent =
        "Error al cargar los productos. Por favor, intenta nuevamente.";
    }
  }
}

/**
 * Muestra los productos en la grilla
 * @param {Array} products - array de productos a mostrar
 */
function displayProducts(products) {
  const productsContainer = document.getElementById("productsContainer");
  const noResults = document.getElementById("noResults");

  // Si no hay productos, muestro mensaje
  if (products.length === 0) {
    if (productsContainer) productsContainer.innerHTML = "";
    if (noResults) noResults.classList.add("show");
    return;
  }

  if (noResults) noResults.classList.remove("show");

  // Genero el HTML para cada producto
  const isListView =
    productsContainer && productsContainer.classList.contains("products-list");

  const productsHTML = products
    .map((product) => {
      const formattedPrice = new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: product.currency || "UYU",
      }).format(product.cost);

      // Construir la URL de la imagen local
      const imageUrl = product.image.startsWith("http")
        ? product.image
        : `../${product.image}`;

      if (isListView) {
        // HTML para vista de lista
        return `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src=''; this.onerror=null;" />
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">${formattedPrice}</div>
                            <div class="product-sold">${product.soldCount} vendidos</div>
                        </div>
                        <button class="btn btn-primary view-details-btn" data-product-id="${product.id}">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `;
      } else {
        // HTML para vista de cuadrícula (por defecto)
        return `
            <div class="product-card" data-product-id="${product.id}">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src=''; this.onerror=null;" />
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">${formattedPrice}</div>
                            <div class="product-sold">${product.soldCount} vendidos</div>
                        </div>
                        <button class="btn btn-primary view-details-btn" data-product-id="${product.id}">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `;
      }
    })
    .join("");

  productsContainer.innerHTML = productsHTML;
}

/**
 * Ve los detalles de un producto específico
 */
function viewProductDetails(productId) {
  // Asegurar que productId sea un número
  const id = typeof productId === "string" ? parseInt(productId) : productId;

  // Buscar el producto en el array de productos
  const product = allProducts.find((p) => p.id === id);

  if (product) {
    // Mostrar información del producto en un alert (solución temporal)
    const formattedPrice = new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: product.currency || "UYU",
    }).format(product.cost);

    alert(
      `📦 ${product.name}\n\n💰 Precio: ${formattedPrice}\n📊 Vendidos: ${product.soldCount}\n\n📝 Descripción:\n${product.description}\n\n⚠️ Próximamente: Página de detalles completa`
    );
  } else {
    alert("❌ Producto no encontrado");
    console.log("ID buscado:", id, "Tipo:", typeof id);
    console.log(
      "IDs disponibles:",
      allProducts.map((p) => ({ id: p.id, tipo: typeof p.id }))
    );
  }
}

/**
 * Filtra los productos según el término de búsqueda
 * Esta función es llamada desde main.js
 */
function filterProducts(searchTerm) {
  if (!searchTerm) {
    displayProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  displayProducts(filtered);
}

/**
 * Búsqueda específica para la página de productos
 * Conecta con la función global de main.js
 */
function performProductSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim();
  filterProducts(searchTerm);
}

/**
 * Ordena los productos según el criterio seleccionado
 */
function sortProducts(criteria) {
  let productsToSort = [...allProducts];

  switch (criteria) {
    case "price-asc":
      productsToSort.sort((a, b) => a.cost - b.cost);
      break;
    case "price-desc":
      productsToSort.sort((a, b) => b.cost - a.cost);
      break;
    case "name-asc":
      productsToSort.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      productsToSort.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "default":
    default:
      // Mantener orden original de la API
      productsToSort = [...allProducts];
      break;
  }

  displayProducts(productsToSort);
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Cargar productos al iniciar la página
  loadProducts();

  // Event listener para el ordenamiento
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortProducts(this.value);
    });
  }

  // Event listener para la búsqueda
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.trim();
      if (searchTerm === "") {
        displayProducts(allProducts);
      } else {
        filterProducts(searchTerm);
      }
    });
  }

  // Event listeners para los botones de vista
  const gridViewBtn = document.getElementById("gridView");
  const listViewBtn = document.getElementById("listView");
  const productsContainer = document.getElementById("productsContainer");

  if (gridViewBtn && listViewBtn && productsContainer) {
    gridViewBtn.addEventListener("click", function () {
      // Cambiar a vista de cuadrícula
      productsContainer.className = "products-grid";
      gridViewBtn.classList.add("active");
      listViewBtn.classList.remove("active");
      // Volver a renderizar los productos con el nuevo layout
      displayProducts(
        filteredProducts.length > 0 ? filteredProducts : allProducts
      );
    });

    listViewBtn.addEventListener("click", function () {
      // Cambiar a vista de lista
      productsContainer.className = "products-list";
      listViewBtn.classList.add("active");
      gridViewBtn.classList.remove("active");
      // Volver a renderizar los productos con el nuevo layout
      displayProducts(
        filteredProducts.length > 0 ? filteredProducts : allProducts
      );
    });
  }

  // Event delegation para botones de detalles de producto
  const productDetailsContainer = document.getElementById("productsContainer");
  if (productDetailsContainer) {
    productDetailsContainer.addEventListener("click", function (e) {
      if (e.target.classList.contains("view-details-btn")) {
        const productId = e.target.getAttribute("data-product-id");
        if (productId) {
          // Convertir a número para que coincida con el ID del producto
          viewProductDetails(parseInt(productId));
        }
      }
    });
  }
});
