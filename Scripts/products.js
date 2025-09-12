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
let allCategories = []; // Todas las categorías disponibles
let currentCategory = null; // Categoría actualmente seleccionada

/**
 * Carga las categorías disponibles desde la API
 * Llena el selector de categorías dinámicamente
 */
async function loadCategories() {
  console.log("🔄 Iniciando carga de categorías...");

  // Fallback en caso de que las variables no estén definidas
  const categoriesUrl =
    typeof CATEGORIES_URL !== "undefined"
      ? CATEGORIES_URL
      : "https://racher95.github.io/diy-emercado-api/cats/cat.json";

  console.log("📡 URL de categorías:", categoriesUrl);

  try {
    const response = await fetch(categoriesUrl);
    console.log(
      "📡 Respuesta de la API:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 Datos recibidos:", data);

    allCategories = data || [];
    console.log("✅ Categorías cargadas:", allCategories.length);

    // Llenar el selector de categorías
    populateCategorySelect();

    return true;
  } catch (error) {
    console.error("❌ Error loading categories:", error);
    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect) {
      categorySelect.innerHTML =
        '<option value="">Error al cargar categorías</option>';
    }
    return false;
  }
}

/**
 * Obtiene la primera categoría disponible como categoría por defecto
 * @returns {string|null} ID de la primera categoría disponible
 */
function getDefaultCategory() {
  if (allCategories.length > 0) {
    return allCategories[0].id;
  }
  return null;
}

/**
 * Llena el selector de categorías con las opciones disponibles
 */
function populateCategorySelect() {
  const categorySelect = document.getElementById("categorySelect");
  console.log("🎯 Elemento categorySelect encontrado:", !!categorySelect);

  if (!categorySelect) return;

  // Limpiar opciones existentes
  categorySelect.innerHTML = '<option value="">Todas las categorías</option>';
  console.log("🧹 Selector limpiado");

  // Agregar cada categoría como opción
  allCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;

    // Marcar como seleccionada si es la categoría actual
    if (category.id == currentCategory) {
      option.selected = true;
    }

    categorySelect.appendChild(option);
    console.log("➕ Categoría agregada:", category.name, "ID:", category.id);
  });

  console.log(
    "✅ Selector de categorías poblado con",
    allCategories.length,
    "categorías"
  );
}

/**
 * Carga los productos desde la API externa
 * Maneja estados de carga, errores y éxito
 * @param {string} categoryId - ID de la categoría a cargar (opcional)
 */
async function loadProducts(categoryId = null) {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const productsContainer = document.getElementById("productsContainer");

  try {
    // Determinar qué categoría cargar
    if (categoryId) {
      currentCategory = categoryId;
    } else if (!currentCategory) {
      // Si no hay categoría actual, usar la de URL o la primera disponible
      const urlParams = new URLSearchParams(window.location.search);
      const urlCategory = urlParams.get("category");

      if (urlCategory) {
        currentCategory = urlCategory;
      } else {
        // Usar la primera categoría disponible como fallback
        currentCategory = getDefaultCategory();

        // Si no hay categorías disponibles, mostrar error
        if (!currentCategory) {
          throw new Error("No hay categorías disponibles");
        }
      }
    }

    // Construir URL dinámica según la categoría
    const productsBaseUrl =
      typeof PRODUCTS_BASE_URL !== "undefined"
        ? PRODUCTS_BASE_URL
        : "https://racher95.github.io/diy-emercado-api/cats_products/";

    const PRODUCTS_API_URL = `${productsBaseUrl}${currentCategory}.json`;

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

    // Aplicar filtro de búsqueda si existe
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

    // Actualizar selector de categorías para mostrar la selección actual
    updateCategorySelector();

    // Renderizar productos
    await displayProducts(productsToShow);

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
 * Actualiza el selector de categorías para mostrar la selección actual
 */
function updateCategorySelector() {
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect && currentCategory) {
    categorySelect.value = currentCategory;
  }
}

/**
 * Muestra los productos en la grilla
 * @param {Array} products - array de productos a mostrar
 */
async function displayProducts(products) {
  const productsContainer = document.getElementById("productsContainer");
  const noResults = document.getElementById("noResults");

  // Si no hay productos, muestro mensaje
  if (products.length === 0) {
    if (productsContainer) productsContainer.innerHTML = "";
    if (noResults) noResults.classList.add("show");
    return;
  }

  if (noResults) noResults.classList.remove("show");

  // Crear array de promesas para verificar imágenes múltiples
  const productsWithImages = await Promise.all(
    products.map(async (product) => {
      try {
        // Intentar obtener múltiples imágenes del producto individual
        const response = await fetch(
          `https://racher95.github.io/diy-emercado-api/products/${product.id}.json`
        );
        if (response.ok) {
          const detailData = await response.json();
          if (
            detailData.images &&
            Array.isArray(detailData.images) &&
            detailData.images.length > 1
          ) {
            return { ...product, images: detailData.images };
          }
        }
      } catch (error) {
        console.log(
          `No se pudieron cargar imágenes adicionales para producto ${product.id}`
        );
      }
      // Fallback a imagen singular
      return { ...product, images: [product.image] };
    })
  );

  // Genero el HTML para cada producto
  const isListView =
    productsContainer && productsContainer.classList.contains("products-list");

  const productsHTML = productsWithImages
    .map((product) => {
      const formattedPrice = new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: product.currency || "UYU",
      }).format(product.cost);

      // Usar las imágenes obtenidas (múltiples o singular)
      const images = product.images;

      // Construir la URL de la primera imagen
      const imageUrl = images[0].startsWith("http")
        ? images[0]
        : `../${images[0]}`;

      if (isListView) {
        // HTML para vista de lista
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${imageUrl}" alt="${
          product.name
        }" class="product-image" onerror="this.src=''; this.onerror=null;" />
                    ${
                      images.length > 1
                        ? `
                        <div class="image-nav">
                            <button class="nav-btn prev-btn" data-images='${JSON.stringify(
                              images
                            )}'>‹</button>
                            <button class="nav-btn next-btn" data-images='${JSON.stringify(
                              images
                            )}'>›</button>
                        </div>
                        <div class="image-indicators">
                            ${images
                              .map(
                                (_, index) =>
                                  `<span class="dot ${
                                    index === 0 ? "active" : ""
                                  }" data-index="${index}"></span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">${formattedPrice}</div>
                            <div class="product-meta">
                                <span class="product-sold">${
                                  product.soldCount
                                } vendidos</span>
                                <span class="product-id">ID: ${
                                  product.id
                                }</span>
                            </div>
                        </div>
                        <button class="btn btn-primary view-details-btn" data-product-id="${
                          product.id
                        }">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `;
      } else {
        // HTML para vista de cuadrícula (por defecto)
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${imageUrl}" alt="${
          product.name
        }" class="product-image" onerror="this.src=''; this.onerror=null;" />
                    ${
                      images.length > 1
                        ? `
                        <div class="image-nav">
                            <button class="nav-btn prev-btn" data-images='${JSON.stringify(
                              images
                            )}'>‹</button>
                            <button class="nav-btn next-btn" data-images='${JSON.stringify(
                              images
                            )}'>›</button>
                        </div>
                        <div class="image-indicators">
                            ${images
                              .map(
                                (_, index) =>
                                  `<span class="dot ${
                                    index === 0 ? "active" : ""
                                  }" data-index="${index}"></span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">${formattedPrice}</div>
                            <div class="product-meta">
                                <span class="product-sold">${
                                  product.soldCount
                                } vendidos</span>
                                <span class="product-id">ID: ${
                                  product.id
                                }</span>
                            </div>
                        </div>
                        <button class="btn btn-primary view-details-btn" data-product-id="${
                          product.id
                        }">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `;
      }
    })
    .join("");

  productsContainer.innerHTML = productsHTML;

  // Inicializar carruseles de imágenes
  initializeImageCarousels();
}

/**
 * Inicializa los carruseles de imágenes en las tarjetas de productos
 */
function initializeImageCarousels() {
  const imageContainers = document.querySelectorAll(".product-image-container");

  imageContainers.forEach((container) => {
    const prevBtn = container.querySelector(".prev-btn");
    const nextBtn = container.querySelector(".next-btn");
    const image = container.querySelector(".product-image");
    const indicators = container.querySelectorAll(".dot");

    if (!prevBtn || !nextBtn) return; // No hay múltiples imágenes

    const images = JSON.parse(prevBtn.dataset.images);
    let currentIndex = 0;

    // Función para actualizar la imagen
    function updateImage(index) {
      currentIndex = index;
      const imageUrl = images[index].startsWith("http")
        ? images[index]
        : `../${images[index]}`;

      image.src = imageUrl;

      // Actualizar indicadores
      indicators.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    // Event listeners para botones de navegación
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      updateImage(newIndex);
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      updateImage(newIndex);
    });

    // Event listeners para indicadores
    indicators.forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateImage(index);
      });
    });
  });
}

/**
 * Ve los detalles de un producto específico
 * Redirige a la página de detalles del producto
 */
function viewProductDetails(productId) {
  // Asegurar que productId sea un número
  const id = typeof productId === "string" ? parseInt(productId) : productId;

  // Buscar el producto en el array de productos
  const product = allProducts.find((p) => p.id === id);

  if (product) {
    // Redirigir a la página de detalles con el ID del producto
    window.location.href = `product-details.html?id=${id}&category=${currentCategory}`;
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
async function filterProducts(searchTerm) {
  if (!searchTerm) {
    await displayProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  await displayProducts(filtered);
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
async function sortProducts(criteria) {
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

  await displayProducts(productsToSort);
}

// Event listeners
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 DOM cargado, iniciando products.js");

  // Verificar que las variables de configuración estén disponibles
  console.log(
    "🔗 CATEGORIES_URL:",
    typeof CATEGORIES_URL !== "undefined" ? CATEGORIES_URL : "NO DEFINIDA"
  );
  console.log(
    "🔗 PRODUCTS_BASE_URL:",
    typeof PRODUCTS_BASE_URL !== "undefined" ? PRODUCTS_BASE_URL : "NO DEFINIDA"
  );

  if (
    typeof CATEGORIES_URL === "undefined" ||
    typeof PRODUCTS_BASE_URL === "undefined"
  ) {
    console.error(
      "❌ Variables de configuración no definidas. Verificar init.js"
    );
    return;
  }

  // Cargar categorías primero
  console.log("📋 Cargando categorías...");
  const categoriesLoaded = await loadCategories();
  console.log("📋 Resultado carga categorías:", categoriesLoaded);

  // Luego cargar productos
  console.log("📦 Cargando productos...");
  await loadProducts();
  console.log("📦 Productos cargados");

  // Event listener para el ordenamiento
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", async function () {
      await sortProducts(this.value);
    });
  }

  // Event listener para cambio de categoría
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      const selectedCategory = this.value;
      if (selectedCategory) {
        loadProducts(selectedCategory);
      } else {
        // Si se selecciona "Todas las categorías", mostrar la primera disponible
        const defaultCategory = getDefaultCategory();
        if (defaultCategory) {
          loadProducts(defaultCategory);
        }
      }
    });
  }

  // Event listener para la búsqueda
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", async function () {
      const searchTerm = this.value.trim();
      if (searchTerm === "") {
        await displayProducts(allProducts);
      } else {
        await filterProducts(searchTerm);
      }
    });
  }

  // Event listeners para los botones de vista
  const gridViewBtn = document.getElementById("gridView");
  const listViewBtn = document.getElementById("listView");
  const productsContainer = document.getElementById("productsContainer");

  if (gridViewBtn && listViewBtn && productsContainer) {
    gridViewBtn.addEventListener("click", async function () {
      // Cambiar a vista de cuadrícula
      productsContainer.className = "products-grid";
      gridViewBtn.classList.add("active");
      listViewBtn.classList.remove("active");
      // Volver a renderizar los productos con el nuevo layout
      await displayProducts(
        filteredProducts.length > 0 ? filteredProducts : allProducts
      );
    });

    listViewBtn.addEventListener("click", async function () {
      // Cambiar a vista de lista
      productsContainer.className = "products-list";
      listViewBtn.classList.add("active");
      gridViewBtn.classList.remove("active");
      // Volver a renderizar los productos con el nuevo layout
      await displayProducts(
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
