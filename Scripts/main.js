/**
 * Script principal de Craftivity
 * Maneja funcionalidades globales como carrito, sesiones, búsqueda y navegación
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Cuando carga cualquier página, ejecuto estas funciones iniciales
document.addEventListener("DOMContentLoaded", async function () {
  // Actualizo el contador del carrito en el header
  updateCartCounter();

  // Configuro el formulario de newsletter del footer
  initNewsletterForm();

  // Configuro la funcionalidad de búsqueda global
  initGlobalSearch();

  // Configuro la navegación programática
  initGlobalNavigation();

  // configurar menu responsive
  initResponsiveMenu();

  // Inicializar carruseles si estamos en index.html
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    await initializeCarousels();
  }
});

/**
 * Actualiza el contador de productos en el botón del carrito
 * Lee el localStorage y muestra la cantidad total de items
 */
function updateCartCounter() {
  // Obtengo el carrito usando la función utilitaria
  const cart = getCart();

  // Calculo el total de items sumando las cantidades de cada producto
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Busco todos los botones de carrito en la página
  const cartButtons = document.querySelectorAll('a[href*="cart.html"]');
  cartButtons.forEach((button) => {
    if (totalItems > 0) {
      button.innerHTML = `🛒 Carrito (${totalItems})`;
    } else {
      button.innerHTML = "🛒 Carrito";
    }
  });
}

/**
 * Verifica si el usuario tiene una sesión activa
 * @returns {object|null} datos de la sesión si está activa, null si no
 */
function checkSession() {
  const sessionData = localStorage.getItem("craftivitySession");

  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60); // Calculo horas transcurridas

      // La sesión es válida por 24 horas
      if (session.isLoggedIn && hoursDiff < 24) {
        return session;
      } else {
        // La sesión expiró, la elimino
        localStorage.removeItem("craftivitySession");
        return null;
      }
    } catch (e) {
      // Si hay error al leer los datos, limpio la sesión corrupta
      localStorage.removeItem("craftivitySession");
      return null;
    }
  }

  return null;
}

/**
 * Actualiza la interfaz cuando hay un usuario logueado
 * Cambia el botón "Iniciar Sesión" por el nombre del usuario
 * @param {object} session - datos de la sesión del usuario
 */
function updateUIForLoggedInUser(session) {
  const loginButtons = document.querySelectorAll('a[href*="login.html"]');

  loginButtons.forEach((button) => {
    button.innerHTML = `👤 ${session.usuario}`;
    button.href = "#";
    button.onclick = function (e) {
      e.preventDefault();
      showUserMenu(); // Muestro un menú desplegable
    };
  });
}

/**
 * Actualiza la interfaz para usuarios no logueados
 * Muestra el botón normal de "Iniciar Sesión"
 */
function updateUIForGuestUser() {
  const loginButtons = document.querySelectorAll('a[href*="login.html"]');
  loginButtons.forEach((button) => {
    button.innerHTML = "Iniciar Sesión";
    // Ajusto la ruta según si estoy en una subcarpeta o no
    const isInSubfolder = window.location.pathname.includes("/pages/");
    button.href = isInSubfolder ? "login.html" : "pages/login.html";
    button.onclick = null;
  });
}

/**
 * Muestra un menú desplegable cuando el usuario hace click en su nombre
 * Incluye opciones como perfil, pedidos y cerrar sesión
 */
function showUserMenu() {
  // Creo un div que actúa como menú contextual
  const menu = document.createElement("div");
  menu.className = "user-menu";
  menu.style.top = "70px";
  menu.style.right = "20px";

  // Determinar rutas según ubicación actual
  const isInSubfolder = window.location.pathname.includes("/pages/");
  const profileUrl = isInSubfolder ? "profile.html" : "pages/profile.html";
  const ordersUrl = isInSubfolder ? "orders.html" : "pages/orders.html";

  // Agrego las opciones del menú con rutas dinámicas
  menu.innerHTML = `
    <div class="user-menu-content">
      <a href="${profileUrl}" class="user-menu-item">Mi Perfil</a>
      <a href="${ordersUrl}" class="user-menu-item">Mis Pedidos</a>
      <hr class="user-menu-separator">
      <a href="#" class="user-menu-item logout" id="logoutBtn">Cerrar Sesión</a>
    </div>
  `;

  document.body.appendChild(menu);

  // Configurar logout
  const logoutBtn = menu.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  // Configuro para que se cierre al hacer click fuera del menú
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu);
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 100);
}

/**
 * Cierra la sesión del usuario y recarga la página
 */
function logout() {
  clearSessionData();
  clearTempCart(); // Limpiar carrito temporal para próximo usuario
  window.location.reload(); // Recargo para actualizar la interfaz
}

/**
 * Configura el formulario de newsletter en el footer
 * Simula una suscripción exitosa
 */
function initNewsletterForm() {
  const newsletterForms = document.querySelectorAll(".newsletter-form");

  newsletterForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Evito que se envíe el formulario

      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (email && isValidEmail(email)) {
        // Simulo una suscripción exitosa
        showNotification(
          "¡Gracias por suscribirte! Recibirás nuestras mejores ofertas.",
          "success"
        );
        emailInput.value = ""; // Limpio el campo
      } else {
        showNotification("Por favor, ingresa un email válido.", "error");
      }
    });
  });
}

/**
 * Valida si un email tiene el formato correcto
 * @param {string} email - el email a validar
 * @returns {boolean} true si es válido
 */
function isValidEmail(email) {
  // Expresión regular básica para validar emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Agrego los estilos de animación necesarios para las notificaciones

/**
 * Funciones de utilidad para formatear precios
 * @param {number} amount - cantidad a formatear
 * @param {string} currency - código de moneda (USD, UYU, etc.)
 * @returns {string} precio formateado
 */
function formatCurrency(amount, currency = "UYU") {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Función debounce para optimizar eventos que se ejecutan muchas veces
 * Útil para búsquedas en tiempo real
 * @param {function} func - función a ejecutar
 * @param {number} wait - milisegundos de espera
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== FUNCIONALIDADES DE BÚSQUEDA GLOBAL =====

// ===== FUNCIONALIDADES DE BÚSQUEDA GLOBAL =====

/**
 * Función de búsqueda global que funciona en todas las páginas
 * Redirige a la página de productos con el término de búsqueda
 */
function performGlobalSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    // Si estamos en otra página que no sea productos, redirigir a productos con búsqueda
    const currentPath = window.location.pathname;
    const isInSubfolder = currentPath.includes("/pages/");
    const productsPath = isInSubfolder
      ? "products.html"
      : "pages/products.html";

    window.location.href = `${productsPath}?search=${encodeURIComponent(
      searchTerm
    )}`;
  }
}

/**
 * Configura los event listeners para la búsqueda global
 */
function initGlobalSearch() {
  // Solo configurar si NO estamos en la página de productos
  // (products.js maneja su propia búsqueda)
  if (!window.location.pathname.includes("products.html")) {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.querySelector('button[type="button"]');

    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          performGlobalSearch();
        }
      });
    }

    if (searchButton) {
      searchButton.addEventListener("click", function (e) {
        e.preventDefault();
        performGlobalSearch();
      });
    }
  }
}

// ===== FUNCIONALIDADES DE MENU RESPONSIVE =====

function initResponsiveMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".craftivity-nav");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      // Toggle clase active en menú toggle (animación hamburguesa)
      this.classList.toggle("active");

      // Toggle clase show en navegación (mostrar/ocultar menú)
      navMenu.classList.toggle("show");
    });

    // Cerrar menú al hacer clic en un enlace (mobile)
    const navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("show");
      });
    });

    // Cerrar menú al redimensionar ventana (evitar bugs)
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("show");
      }
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("show");
      }
    });
  }
}

// ===== FUNCIONALIDADES DE NAVEGACIÓN =====

/**
 * Navega a la página de productos
 */
function navigateToProducts() {
  const currentPath = window.location.pathname;
  const isInSubfolder = currentPath.includes("/pages/");
  const productsPath = isInSubfolder ? "products.html" : "pages/products.html";
  window.location.href = productsPath;
}

/**
 * Configura la navegación programática
 */
function initGlobalNavigation() {
  // Event delegation para elementos con data-navigate
  document.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-navigate")) {
      e.preventDefault();
      const destination = e.target.getAttribute("data-navigate");

      switch (destination) {
        case "products":
          navigateToProducts();
          break;
      }
    }
  });
}

// ===== SISTEMA DE CARRUSELES =====

/**
 * Inicializa los carruseles de la página principal
 */
async function initializeCarousels() {
  try {
    console.log("Cargando carruseles...");

    // Cargar datos de APIs con fetch simple
    const [flashSalesResponse, featuredResponse] = await Promise.all([
      fetch(API_CONFIG.HOT_SALES),
      fetch(API_CONFIG.FEATURED),
    ]);

    const flashSalesData = await flashSalesResponse.json();
    const featuredData = await featuredResponse.json();

    // Renderizar carruseles
    renderCarousel("flashGrid", flashSalesData.products, "flash-sale");
    renderCarousel("featuredGrid", featuredData.products, "featured");

    // Inicializar navegación
    initCarouselNavigation(
      "flash",
      "flashGrid",
      "flashPrevBtn",
      "flashNextBtn"
    );
    initCarouselNavigation(
      "featured",
      "featuredGrid",
      "featuredPrevBtn",
      "featuredNextBtn"
    );

    // Inicializar countdowns
    initializeCountdowns();

    console.log("Carruseles cargados correctamente");
  } catch (error) {
    console.error("❌ Error al cargar carruseles:", error);
  }
}

/**
 * Renderiza un carrusel con productos
 */
function renderCarousel(containerId, products, context) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  products.forEach((product) => {
    const card = createUniversalProductCard(product, context);
    container.appendChild(card);
  });
}

/**
 * Inicializa navegación de carrusel
 */
function initCarouselNavigation(name, trackId, prevBtnId, nextBtnId) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function updateCarousel() {
    const itemsToShow = getItemsToShow();
    const totalItems = track.children.length;
    const maxIndex = Math.max(0, totalItems - itemsToShow);

    // Asegurar que el índice esté dentro del rango válido
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

    // Calcular el porcentaje de movimiento
    const movePercentage =
      totalItems > 0 ? (currentIndex / totalItems) * 100 : 0;

    track.style.transform = `translateX(-${movePercentage}%)`;

    // Actualizar estado de botones
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex || totalItems <= itemsToShow;

    // Añadir/remover clases para styling
    prevBtn.classList.toggle("disabled", currentIndex === 0);
    nextBtn.classList.toggle(
      "disabled",
      currentIndex >= maxIndex || totalItems <= itemsToShow
    );
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener("click", () => {
    const itemsToShow = getItemsToShow();
    const maxIndex = Math.max(0, track.children.length - itemsToShow);
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  // Auto-update en resize con debounce
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel();
    }, 100);
  });

  // Inicializar
  updateCarousel();
}

/**
 * Determina cuántos items mostrar según el ancho de pantalla
 */
function getItemsToShow() {
  const width = window.innerWidth;
  if (width >= 1200) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1;
}

/**
 * Inicializa todos los countdowns
 */
function initializeCountdowns() {
  document.querySelectorAll(".countdown-timer[data-end]").forEach((timer) => {
    const endDate = timer.dataset.end;
    const productId = timer.dataset.productId;
    startCountdown(timer, endDate, productId);
  });
}

/**
 * Inicia un countdown individual
 */
function startCountdown(element, endDate, productId) {
  const updateTimer = () => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;

    if (distance < 0) {
      element.textContent = "¡Expirada!";
      const card = element.closest(".product-card");
      if (card) card.style.opacity = "0.6";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) {
      element.textContent = `${days}d ${hours}h ${minutes}m`;
    } else {
      element.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}
