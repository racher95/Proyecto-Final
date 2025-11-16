/**
 * Script principal de Craftivity
 * Maneja funcionalidades globales como carrito, sesiones, búsqueda y navegación
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// M1 FIX: Esperar a que los componentes (header/footer) se carguen antes de inicializar
document.addEventListener("componentsLoaded", function () {
  // M1 FIX: Ahora el header ya existe, podemos inicializar el menú responsive
  initResponsiveMenu();

  // Actualizo el contador del carrito en el header
  updateCartCounter();

  // Configuro el formulario de newsletter del footer
  initNewsletterForm();

  // Configuro la funcionalidad de búsqueda global
  initGlobalSearch();

  // Configuro la navegación programática
  initGlobalNavigation();

  // Inicializar tema del usuario
  initializeTheme();

  // Configurar botón de tema para usuarios no logueados
  initGuestThemeToggle();
});

// Inicializar carruseles cuando el DOM esté listo (no dependen de header/footer)
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar carruseles si estamos en index.html
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    initializeCarousels();
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

  // Obtener perfil del usuario para acceder al avatar
  const userProfile = getUserProfile(session.usuario);

  loginButtons.forEach((button) => {
    // Limpiar contenido previo
    button.innerHTML = "";

    // Crear contenedor para avatar + nombre
    const userDisplay = document.createElement("span");
    userDisplay.className = "nav-user-display";

    // Crear avatar
    const avatarElement = document.createElement("div");
    avatarElement.className = "nav-avatar";

    if (userProfile && userProfile.avatarDataUrl) {
      // Si hay avatar, mostrar imagen
      const avatarImg = document.createElement("img");
      avatarImg.src = userProfile.avatarDataUrl;
      avatarImg.alt = session.usuario;
      avatarImg.className = "nav-avatar-img";
      avatarElement.appendChild(avatarImg);
    } else {
      // Si no hay avatar, mostrar iniciales con degradado
      avatarElement.classList.add("nav-avatar-placeholder");
      const initials = session.usuario.substring(0, 2).toUpperCase();
      avatarElement.setAttribute("data-initials", initials);
      avatarElement.textContent = initials;
    }

    // Crear texto con nombre de usuario
    const userName = document.createElement("span");
    userName.className = "nav-user-name";
    userName.textContent = session.usuario;

    // Agregar elementos al contenedor
    userDisplay.appendChild(avatarElement);
    userDisplay.appendChild(userName);
    button.appendChild(userDisplay);

    // Configurar comportamiento
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

  // Obtener tema actual del usuario
  const sessionData = checkSession();
  const userProfile = sessionData ? getUserProfile(sessionData.usuario) : null;
  const currentTheme = userProfile?.theme || "light";
  const themeIcon = currentTheme === "light" ? "🌙" : "☀️";
  const themeText = currentTheme === "light" ? "Modo Oscuro" : "Modo Claro";

  // Crear HTML para el avatar del menú
  let avatarHTML = "";
  if (userProfile && userProfile.avatarDataUrl) {
    avatarHTML = `<img src="${userProfile.avatarDataUrl}" alt="${sessionData.usuario}" class="user-menu-avatar-img">`;
  } else {
    const initials = sessionData.usuario.substring(0, 2).toUpperCase();
    avatarHTML = `<div class="user-menu-avatar-placeholder" data-initials="${initials}">${initials}</div>`;
  }

  // Agrego las opciones del menú con rutas dinámicas e información del usuario
  menu.innerHTML = `
    <div class="user-menu-content">
      <div class="user-menu-header">
        <div class="user-menu-avatar">
          ${avatarHTML}
        </div>
        <div class="user-menu-info">
          <div class="user-menu-username">${sessionData.usuario}</div>
          <div class="user-menu-email">${
            userProfile?.email || "Sin email"
          }</div>
        </div>
      </div>
      <hr class="user-menu-separator">
      <a href="${profileUrl}" class="user-menu-item">👤 Mi Perfil</a>
      <a href="${ordersUrl}" class="user-menu-item">📦 Mis Pedidos</a>
      <button id="themeToggleBtn" class="user-menu-item user-menu-button">
        ${themeIcon} ${themeText}
      </button>
      <hr class="user-menu-separator">
      <a href="#" class="user-menu-item logout" id="logoutBtn">🚪 Cerrar Sesión</a>
    </div>
  `;

  document.body.appendChild(menu);

  // Configurar toggle de tema
  const themeToggleBtn = menu.querySelector("#themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      toggleTheme();
      // Cerrar menú después de cambiar tema
      closeUserMenu(menu);
    });
  }

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
        closeUserMenu(menu);
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 100);
}

/**
 * Cierra el menú de usuario
 * @param {HTMLElement} menu - Elemento del menú a cerrar
 */
function closeUserMenu(menu) {
  if (menu && menu.parentNode) {
    document.body.removeChild(menu);
  }
}

/**
 * Alterna entre tema claro y oscuro
 * Persiste la preferencia en el perfil del usuario
 */
function toggleTheme() {
  const sessionData = checkSession();
  if (!sessionData || !sessionData.isLoggedIn) {
    console.warn("No se puede cambiar tema: usuario no logueado");
    return;
  }

  const username = sessionData.usuario;
  const userProfile = getUserProfile(username);
  const currentTheme = userProfile?.theme || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Actualizar perfil con nuevo tema
  upsertUserProfile(username, { theme: newTheme });

  // Aplicar tema al DOM
  applyTheme(newTheme);

  // Notificar al usuario
  const themeEmoji = newTheme === "dark" ? "🌙" : "☀️";
  const themeName = newTheme === "dark" ? "Oscuro" : "Claro";
  showNotification(`${themeEmoji} Tema ${themeName} activado`, "success");

  console.log(`Tema cambiado a: ${newTheme}`);
}

/**
 * Aplica un tema al documento
 * @param {string} theme - "light" o "dark"
 */
function applyTheme(theme) {
  const validTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", validTheme);

  // Cambiar logo del footer segun el tema
  updateLogo(validTheme);

  // Cambiar favicon segun el tema
  updateFavicon(validTheme);

  console.log(`Tema aplicado: ${validTheme}`);
}

/**
 * Actualiza el logo del footer segun el tema
 * @param {string} theme - "light" o "dark"
 */
function updateLogo(theme) {
  const logos = document.querySelectorAll(".jap-logo");
  const logoPath = theme === "dark" ? "logojapdark.png" : "japlogo.png";

  logos.forEach((logo) => {
    // Detectar si estamos en una subcarpeta
    const isInSubfolder = window.location.pathname.includes("/pages/");
    const basePath = isInSubfolder ? "../img/" : "img/";

    logo.src = basePath + logoPath;
    logo.alt = theme === "dark" ? "JAP Logo (Dark)" : "JAP Logo";
  });
}

/**
 * Actualiza el favicon segun el tema
 * @param {string} theme - "light" o "dark"
 */
function updateFavicon(theme) {
  const faviconPath = theme === "dark" ? "faviconDark.ico" : "favicon.ico";

  // Buscar el link del favicon
  let faviconLink = document.querySelector("link[rel*='icon']");

  if (faviconLink) {
    // Detectar si estamos en una subcarpeta
    const isInSubfolder = window.location.pathname.includes("/pages/");
    const basePath = isInSubfolder ? "../img/" : "img/";

    faviconLink.href = basePath + faviconPath;
  }
}

/**
 * Inicializa el tema al cargar la página
 * Lee la preferencia del usuario y la aplica
 */
function initializeTheme() {
  const sessionData = checkSession();

  if (sessionData && sessionData.isLoggedIn) {
    // Usuario logueado: aplicar su tema preferido
    const username = sessionData.usuario;
    const userProfile = getUserProfile(username);
    const theme = userProfile?.theme || "light";
    applyTheme(theme);
  } else {
    // Usuario no logueado: usar preferencia de localStorage o tema claro por defecto
    const guestTheme = localStorage.getItem("guestTheme") || "light";
    applyTheme(guestTheme);
  }
}

/**
 * Configura el botón de tema para usuarios no logueados
 * Muestra/oculta el botón según el estado de sesión
 */
function initGuestThemeToggle() {
  const themeToggleBtn = document.getElementById("guestThemeToggle");
  if (!themeToggleBtn) return;

  const sessionData = checkSession();

  if (!sessionData || !sessionData.isLoggedIn) {
    // Usuario NO logueado: mostrar botón y configurar evento
    themeToggleBtn.classList.add("visible");

    // Actualizar icono según tema actual
    updateGuestThemeIcon();

    // Evento de clic
    themeToggleBtn.addEventListener("click", toggleGuestTheme);
  } else {
    // Usuario logueado: ocultar botón (ya tiene toggle en menú de usuario)
    themeToggleBtn.classList.remove("visible");
  }
}

/**
 * Alterna el tema para usuarios no logueados
 * Guarda la preferencia en localStorage
 */
function toggleGuestTheme() {
  const currentTheme = localStorage.getItem("guestTheme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Guardar preferencia
  localStorage.setItem("guestTheme", newTheme);

  // Aplicar tema
  applyTheme(newTheme);

  // Actualizar icono del botón
  updateGuestThemeIcon();

  // Notificar
  const themeEmoji = newTheme === "dark" ? "🌙" : "☀️";
  const themeName = newTheme === "dark" ? "Oscuro" : "Claro";
  showNotification(`${themeEmoji} Tema ${themeName} activado`, "success");
}

/**
 * Actualiza el icono del botón de tema para invitados
 */
function updateGuestThemeIcon() {
  const themeToggleBtn = document.getElementById("guestThemeToggle");
  if (!themeToggleBtn) return;

  const themeIcon = themeToggleBtn.querySelector(".theme-icon");
  if (!themeIcon) return;

  const currentTheme = localStorage.getItem("guestTheme") || "light";

  // Actualizar icono
  themeIcon.textContent = currentTheme === "light" ? "🌙" : "☀️";

  // Actualizar clase del switch para animación
  if (currentTheme === "dark") {
    themeToggleBtn.classList.add("dark-mode");
  } else {
    themeToggleBtn.classList.remove("dark-mode");
  }

  // Actualizar título
  themeToggleBtn.title =
    currentTheme === "light" ? "Activar modo oscuro" : "Activar modo claro";
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
    console.error("Error al cargar carruseles:", error);
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

  const container = track.parentElement;
  let currentIndex = 0;

  function updateCarousel() {
    const itemsToShow = getItemsToShow();
    const totalItems = track.children.length;
    const maxIndex = Math.max(0, totalItems - itemsToShow);

    // Asegurar que el índice esté dentro del rango válido
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

    let atEnd = totalItems <= itemsToShow;

    // Calcular desplazamiento basado en el ancho real de las cards + gap
    if (totalItems > 0 && track.children[0]) {
      const firstCard = track.children[0];
      const cardRect = firstCard.getBoundingClientRect();
      const styles = window.getComputedStyle(track);
      const gapValue =
        parseFloat(styles.gap || styles.columnGap || styles.rowGap || "0") || 0;
      const step = cardRect.width + gapValue;
      let containerInnerWidth = 0;

      if (container) {
        const containerStyles = window.getComputedStyle(container);
        const paddingLeft = parseFloat(containerStyles.paddingLeft || "0") || 0;
        const paddingRight =
          parseFloat(containerStyles.paddingRight || "0") || 0;
        const containerWidth = container.getBoundingClientRect().width;
        containerInnerWidth = Math.max(
          0,
          containerWidth - paddingLeft - paddingRight
        );
      }

      const maxOffset = Math.max(
        0,
        track.scrollWidth -
          (containerInnerWidth > 0
            ? containerInnerWidth
            : Math.ceil(cardRect.width))
      );
      const rawDistance = currentIndex * step;
      let moveDistance = Math.min(rawDistance, maxOffset);

      if (currentIndex === maxIndex) {
        moveDistance = maxOffset;
      }

      track.style.transform = `translateX(-${moveDistance}px)`;
      atEnd = moveDistance >= maxOffset - 1 || totalItems <= itemsToShow;
    } else {
      track.style.transform = `translateX(0)`;
      currentIndex = 0;
      atEnd = true;
    }

    const atStart = currentIndex === 0 || totalItems <= itemsToShow;

    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;

    // Añadir/remover clases para styling
    prevBtn.classList.toggle("disabled", prevBtn.disabled);
    nextBtn.classList.toggle("disabled", nextBtn.disabled);
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
  if (width >= 1201) return 4;
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
