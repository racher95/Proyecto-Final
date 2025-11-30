/**
 * Gestión del catálogo de productos de Craftivity
 * Maneja la carga desde API, filtrado, búsqueda y carrito
 *
 * Nota: Las funciones showNotification() y updateCartCounter() están
 * centralizadas en main.js para evitar duplicación de código.
 */

// Variables globales para manejar los productos
let allProducts = []; // Todos los productos cargados desde la API (categoría actual)
let allCategories = []; // Todas las categorías disponibles
let allProductsUniversal = []; // Todos los productos de todas las categorías (para búsqueda universal)
let currentCategory = null; // Categoría actualmente seleccionada

/**
 * Carga las categorías desde la API y llena el selector
 */
async function loadCategories() {
  const categoriesUrl =
    typeof CATEGORIES_URL !== "undefined"
      ? CATEGORIES_URL
      : API_CONFIG.CATEGORIES;

  try {
    const response = await fetch(categoriesUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    allCategories = data || [];

    // Llenar el selector de categorías
    populateCategorySelect();

    return true;
  } catch (error) {
    console.error("Error loading categories:", error);
    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect) {
      categorySelect.innerHTML =
        '<option value="">Error al cargar categorías</option>';
    }
    return false;
  }
}

/**
 * Carga todos los productos de todas las categorías para búsqueda universal
 */
async function loadAllProductsUniversal() {
  try {
    const response = await fetch(API_CONFIG.PRODUCTS);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    // El backend devuelve directamente el array de productos
    allProductsUniversal = Array.isArray(products) ? products : [];

    allProductsUniversal = allProductsUniversal.map((product) => ({
      ...product,
      categoryId: product.category || product.categoryId,
      categoryName: product.categoryName || "",
    }));

    await retrySearchFromURL();
  } catch (error) {
    console.error("Error cargando productos universales:", error);
    allProductsUniversal = [];
  }
}

/**
 * Re-ejecuta la búsqueda desde URL si existe y no se había ejecutado con búsqueda universal
 */
async function retrySearchFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get("search");

  if (searchTerm && allProductsUniversal.length > 0) {
    await filterProducts(searchTerm);
  }
}

/**
 * Muestra TODOS los productos de TODAS las categorías
 */
async function displayAllProducts() {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const productsContainer = document.getElementById("productsContainer");

  try {
    // Mostrar indicador de carga
    if (loadingMessage) loadingMessage.style.display = "block";
    if (errorMessage) errorMessage.style.display = "none";
    if (productsContainer) productsContainer.innerHTML = "";

    // Si no hay productos universales cargados, cargarlos
    if (allProductsUniversal.length === 0) {
      await loadAllProductsUniversal();
    }

    // Ocultar indicador de carga
    if (loadingMessage) loadingMessage.style.display = "none";

    // Actualizar título del hero
    const heroTitle = document.querySelector(".catalog-hero h1");
    if (heroTitle) {
      heroTitle.textContent = "Nuestro Catálogo";
    }

    const heroDescription = document.querySelector(".catalog-hero p");
    if (heroDescription) {
      heroDescription.textContent =
        "Descubre nuestra increíble selección de productos DIY";
    }

    // Usar imagen por defecto en el hero
    const heroSection = document.querySelector(".catalog-hero");
    if (heroSection) {
      heroSection.style.backgroundImage =
        "url('https://res.cloudinary.com/dcdfqlivp/image/upload/v1764126557/ui/cars_index.jpg')";
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
    }

    // Guardar productos originales y mostrarlos
    allProducts = [...allProductsUniversal];
    currentCategory = null; // No hay categoría específica seleccionada

    // Aplicar filtros y mostrar productos
    await applyAllFilters();
  } catch (error) {
    console.error("Error mostrando todos los productos:", error);
    if (loadingMessage) loadingMessage.style.display = "none";
    if (errorMessage) {
      errorMessage.style.display = "block";
      errorMessage.textContent =
        "Error al cargar los productos. Por favor, intenta de nuevo.";
    }
  }
}

/**
 * Llena el selector de categorías con las opciones disponibles
 */
function populateCategorySelect() {
  const categorySelect = document.getElementById("categorySelect");

  if (!categorySelect) return;

  // Limpiar opciones existentes
  categorySelect.innerHTML = '<option value="">Todas las categorías</option>';

  // Agregar cada categoría como opción
  allCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = `${category.name} [ID: ${category.id}]`;

    // Marcar como seleccionada si es la categoría actual
    if (category.id == currentCategory) {
      option.selected = true;
    }

    categorySelect.appendChild(option);
  });
}

/**
 * Actualiza la imagen del hero section según la categoría seleccionada
 * @param {string} categoryId - ID de la categoría
 */
function updateCategoryHeroImage(categoryId) {
  const heroSection = document.querySelector(".catalog-hero");
  if (!heroSection) return;

  // Buscar la categoría en allCategories
  const category = allCategories.find((cat) => cat.id == categoryId);

  if (category) {
    // Actualizar título del hero con el nombre de la categoría
    const heroTitle = document.querySelector(".catalog-hero h1");
    if (heroTitle) {
      heroTitle.textContent = category.name;
    }

    // Actualizar descripción del hero
    const heroDescription = document.querySelector(".catalog-hero p");
    if (heroDescription) {
      heroDescription.textContent =
        category.description ||
        `Descubre nuestra selección de ${category.name}`;
    }

    // Actualizar imagen de fondo
    if (category.imgSrc && category.imgSrc !== "") {
      // Si la categoría tiene imagen, usarla
      heroSection.style.backgroundImage = `url('${category.imgSrc}')`;
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
    } else {
      // Si no tiene imagen, usar la imagen por defecto
      heroSection.style.backgroundImage =
        "url('https://res.cloudinary.com/dcdfqlivp/image/upload/v1764126557/ui/cars_index.jpg')";
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
    }
  } else {
    // Si no se encuentra la categoría, usar valores por defecto
    const heroTitle = document.querySelector(".catalog-hero h1");
    if (heroTitle) {
      heroTitle.textContent = "Nuestro Catálogo";
    }

    const heroDescription = document.querySelector(".catalog-hero p");
    if (heroDescription) {
      heroDescription.textContent =
        "Descubre nuestra increíble selección de productos DIY";
    }

    heroSection.style.backgroundImage =
      "url('https://res.cloudinary.com/dcdfqlivp/image/upload/v1764126557/ui/cars_index.jpg')";
    heroSection.style.backgroundSize = "cover";
    heroSection.style.backgroundPosition = "center";
  }
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
      // Si no hay categoría actual, usar la de URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlCategory = urlParams.get("category");

      if (urlCategory) {
        currentCategory = urlCategory;
      } else {
        // Si no hay parámetro de URL, mostrar TODAS las categorías
        await displayAllProducts();
        return;
      }
    }

    // Construir URL con query params para el backend
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");

    // Backend REST endpoint
    let apiUrl = API_CONFIG.PRODUCTS;
    const queryParams = new URLSearchParams();

    if (currentCategory) {
      queryParams.append("category", currentCategory);
    }

    if (searchTerm) {
      queryParams.append("search", searchTerm);
    }

    const PRODUCTS_API_URL = queryParams.toString()
      ? `${apiUrl}?${queryParams.toString()}`
      : apiUrl;

    // Muestro el loading
    if (loadingMessage) loadingMessage.classList.add("show");
    if (errorMessage) errorMessage.classList.remove("show");
    if (productsContainer) productsContainer.innerHTML = "";

    // Fetch del backend REST
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // El backend devuelve directamente el array de productos
    allProducts = Array.isArray(data) ? data : [];

    // Agregar categoryId a todos los productos si no lo tienen
    allProducts = allProducts.map((product) => ({
      ...product,
      categoryId: product.category || currentCategory,
    }));

    let productsToShow = allProducts;
    if (searchTerm) {
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.value = searchTerm;

      // Usar búsqueda universal si está disponible, sino buscar solo en categoría actual
      if (allProductsUniversal.length > 0) {
        productsToShow = allProductsUniversal.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Actualizar selector para mostrar búsqueda
        updateCategorySelectorForSearch(searchTerm, productsToShow.length);
      } else {
        productsToShow = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } else {
      // Actualizar selector de categorías para mostrar la selección actual (sin búsqueda)
      updateCategorySelector();
    }

    // Renderizar productos
    await displayProducts(productsToShow);

    // Actualizar hero (imagen, título y descripción) según la categoría
    updateCategoryHeroImage(currentCategory);

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

  // El backend ya devuelve toda la información necesaria (images, flashSale, featured)
  // No necesitamos hacer llamadas adicionales
  const productsWithData = products.map((product) => ({
    ...product,
    images: product.images || [product.image],
    flashSale: product.flashSale || product.flash_sale || { active: false },
    featured: product.featured || false,
    flashPrice: product.flash_price,
    originalPrice: product.cost,
  }));

  // Genero el HTML para cada producto
  const isListView =
    productsContainer && productsContainer.classList.contains("products-list");

  const productsHTML = productsWithData
    .map((product) => {
      // Usar la función modular para crear tarjetas
      return createUniversalProductCard(product, "catalog").outerHTML;
    })
    .join("");

  productsContainer.innerHTML = productsHTML;

  // Inicializar carruseles de imágenes
  initializeImageCarousels();

  // Inicializar contadores de flash sales
  if (typeof initializeCountdowns === "function") {
    initializeCountdowns();
  }
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

    // Event listeners para navegación
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      updateImage(newIndex);
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      updateImage(newIndex);
    });

    // Event listeners para indicadores
    indicators.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        updateImage(index);
      });
    });
  });
}

/**
 * Navega a la página de detalles del producto
 */
function viewProductDetails(id) {
  let product = null;
  let productCategory = currentCategory;

  // Buscar el producto en la lista actual (categoría o resultados de búsqueda)
  if (allProducts.length > 0) {
    product = allProducts.find((p) => p.id == id);
  }

  // Si no se encuentra, buscar en productos universales
  if (!product && allProductsUniversal.length > 0) {
    product = allProductsUniversal.find((p) => p.id == id);
    if (product) {
      // Si se encuentra en búsqueda universal, usar su categoría específica
      productCategory =
        product.categoryId || product.category || currentCategory;
    }
  }

  if (product) {
    // Redirigir a la página de detalles con el ID del producto y su categoría
    window.location.href = `product-details.html?id=${id}&category=${productCategory}`;
  } else {
    alert("Producto no encontrado");
  }
}

/**
 * Filtra los productos según el término de búsqueda
 * Busca de forma universal en todas las categorías
 */
async function filterProducts(searchTerm) {
  if (!searchTerm) {
    // Si no hay término de búsqueda, mostrar productos de la categoría actual
    await applyAllFilters();
    return;
  }

  // Buscar en todos los productos de todas las categorías
  const filtered = allProductsUniversal.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actualizar el selector de categorías para mostrar "Resultados de búsqueda"
  updateCategorySelectorForSearch(searchTerm, filtered.length);

  // Aplicar filtro de precio a los resultados de búsqueda
  const finalFiltered = applyPriceFilter(filtered);
  await displayProducts(finalFiltered);
}

/**
 * Aplica filtro de precio a una lista de productos
 * @param {Array} products - Lista de productos a filtrar
 * @returns {Array} Productos filtrados por precio
 */
function applyPriceFilter(products) {
  const minPrice = document.getElementById("minPrice")?.value;
  const maxPrice = document.getElementById("maxPrice")?.value;

  if (!minPrice && !maxPrice) {
    return products;
  }

  return products.filter((product) => {
    const price = product.cost || 0;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;

    return price >= min && price <= max;
  });
}

/**
 * Aplica todos los filtros activos (búsqueda, precio, orden)
 */
async function applyAllFilters() {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput?.value.trim();

  let productsToFilter = searchTerm
    ? allProductsUniversal.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProducts;

  // Aplicar filtro de precio
  const filteredByPrice = applyPriceFilter(productsToFilter);

  // Aplicar ordenamiento
  const sortSelect = document.getElementById("sortSelect");
  const sortCriteria = sortSelect?.value || "default";

  const sortedProducts = applySorting(filteredByPrice, sortCriteria);

  await displayProducts(sortedProducts);
}

/**
 * Aplica ordenamiento a una lista de productos
 * @param {Array} products - Lista de productos a ordenar
 * @param {string} criteria - Criterio de ordenamiento
 * @returns {Array} Productos ordenados
 */
function applySorting(products, criteria) {
  const productsToSort = [...products];

  switch (criteria) {
    case "price-asc":
      return productsToSort.sort((a, b) => a.cost - b.cost);
    case "price-desc":
      return productsToSort.sort((a, b) => b.cost - a.cost);
    case "relevance-desc":
      return productsToSort.sort(
        (a, b) => (b.soldCount || 0) - (a.soldCount || 0)
      );
    case "name-asc":
      return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return productsToSort.sort((a, b) => b.name.localeCompare(a.name));
    case "default":
    default:
      return productsToSort;
  }
}

/**
 * Actualiza el selector de categorías para mostrar información de búsqueda
 */
function updateCategorySelectorForSearch(searchTerm, resultCount) {
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    // Guardar el valor actual para poder restaurarlo
    const originalValue = categorySelect.value;

    // Crear una opción temporal para mostrar resultados de búsqueda
    categorySelect.innerHTML = `
      <option value="search" selected>🔍 "${searchTerm}" (${resultCount} resultados)</option>
      <option value="">Todas las categorías</option>
    `;

    // Agregar categorías normales
    allCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
}

/**
 * Ordena los productos según el criterio seleccionado
 */
async function sortProducts(criteria) {
  await applyAllFilters();
}

// Event listeners
document.addEventListener("DOMContentLoaded", async function () {
  if (!API_CONFIG || !API_CONFIG.CATEGORIES || !API_CONFIG.PRODUCTS) {
    return;
  }

  const categoriesLoaded = await loadCategories();

  if (categoriesLoaded) {
    await loadAllProductsUniversal();
  }

  await loadProducts();

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

      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = "";
      }

      if (selectedCategory && selectedCategory !== "search") {
        loadProducts(selectedCategory);
      } else if (selectedCategory === "") {
        // Si se selecciona "Todas las categorías", mostrar TODOS los productos
        displayAllProducts();
      }
      // Si selectedCategory === "search", no hacer nada (mantener resultados de búsqueda)
    });
  }

  // Event listener para la búsqueda
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", async function () {
      const searchTerm = this.value.trim();
      if (searchTerm === "") {
        // Restaurar selector de categorías normal
        populateCategorySelect();
        // Mostrar productos de la categoría actual
        await applyAllFilters();
      } else {
        await filterProducts(searchTerm);
      }
    });
  }

  // Event listeners para el filtro de precio
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");
  const clearPriceBtn = document.getElementById("clearPriceFilter");

  if (minPriceInput) {
    minPriceInput.addEventListener("input", async function () {
      await applyAllFilters();
    });
  }

  if (maxPriceInput) {
    maxPriceInput.addEventListener("input", async function () {
      await applyAllFilters();
    });
  }

  if (clearPriceBtn) {
    clearPriceBtn.addEventListener("click", async function () {
      if (minPriceInput) minPriceInput.value = "";
      if (maxPriceInput) maxPriceInput.value = "";
      await applyAllFilters();
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
      await displayProducts(allProducts);
    });

    listViewBtn.addEventListener("click", async function () {
      // Cambiar a vista de lista
      productsContainer.className = "products-list";
      listViewBtn.classList.add("active");
      gridViewBtn.classList.remove("active");
      // Volver a renderizar los productos con el nuevo layout
      await displayProducts(allProducts);
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
