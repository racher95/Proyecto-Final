/**
 * Script principal de Craftivity
 * Maneja funcionalidades globales como carrito, sesiones, búsqueda y navegación
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Cuando carga cualquier página, ejecuto estas funciones iniciales
document.addEventListener("DOMContentLoaded", function () {
  // Actualizo el contador del carrito en el header
  updateCartCounter();

  // Verifico si el usuario está logueado (implementado para el desafío extra)
  checkSessionStatus();

  // Configuro el formulario de newsletter del footer
  initNewsletterForm();

  // Configuro la funcionalidad de búsqueda global
  initGlobalSearch();

  // Configuro la navegación programática
  initGlobalNavigation();
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
 * DESAFÍO IMPLEMENTADO: Verificación automática de sesión
 * Muestra un aviso elegante para invitar a usuarios no logueados a iniciar sesión
 * Solo aplica redirección forzada para páginas verdaderamente privadas
 */
function checkSessionStatus() {
  // Obtengo datos de sesión usando función utilitaria
  const sessionData = getSessionData();

  if (sessionData && sessionData.isLoggedIn) {
    // Usuario logueado - actualizar interfaz
    updateUIForLoggedInUser(sessionData);
  } else {
    // Usuario NO logueado - mostrar prompt elegante
    showLoginPrompt();
  }
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

  // Agrego las opciones del menú
  menu.innerHTML = `
    <div class="user-menu-content">
      <a href="pages/profile.html" class="user-menu-item">Mi Perfil</a>
      <a href="pages/orders.html" class="user-menu-item">Mis Pedidos</a>
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
 * Muestra un aviso centrado para invitar al usuario a iniciar sesión.
 * Este aviso aparece en páginas públicas cuando el usuario no está logueado.
 */
function showLoginPrompt() {
  // Evito mostrar el prompt si ya existe uno
  if (document.getElementById("loginPrompt")) return;

  // Crear overlay de fondo
  const overlay = document.createElement("div");
  overlay.id = "loginPromptOverlay";
  overlay.className = "modal-overlay";

  // Crear el modal principal
  const prompt = document.createElement("div");
  prompt.id = "loginPrompt";
  prompt.className = "login-prompt";

  const isInSubfolder = window.location.pathname.includes("/pages/");
  const loginPath = isInSubfolder ? "login.html" : "pages/login.html";

  prompt.innerHTML = `
    <div>
      <div class="emoji-icon">🎨</div>
      <h3>¡Desbloquea tu Experiencia Craftivity!</h3>
      <p>Inicia sesión para guardar tu carrito, ver tu historial de compras y obtener recomendaciones personalizadas.</p>
    </div>

    <div class="button-group">
      <a href="${loginPath}" class="btn btn-primary">
        ✨ Iniciar Sesión
      </a>
      <button class="btn btn-secondary" id="closePromptBtn">
        Ahora No
      </button>
    </div>

    <button class="close-button" id="closePromptX" title="Cerrar">
      ✖
    </button>
  `;

  // Agregar el prompt al overlay
  overlay.appendChild(prompt);

  // Configurar event listeners para cerrar
  const closePromptBtn = prompt.querySelector("#closePromptBtn");
  const closePromptX = prompt.querySelector("#closePromptX");

  if (closePromptBtn) {
    closePromptBtn.addEventListener("click", closeLoginPrompt);
  }

  if (closePromptX) {
    closePromptX.addEventListener("click", closeLoginPrompt);
  }

  // Agregar todo al body
  document.body.appendChild(overlay);

  // Cerrar con ESC
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeLoginPrompt();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  // Cerrar al hacer clic en el overlay (fondo)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeLoginPrompt();
    }
  });
}

/**
 * Cierra el aviso de inicio de sesión
 */
function closeLoginPrompt() {
  const overlay = document.getElementById("loginPromptOverlay");
  if (overlay) {
    overlay.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
}

/**
 * Cierra la sesión del usuario y recarga la página
 */
function logout() {
  localStorage.removeItem("craftivitySession");
  localStorage.removeItem("craftivityCart"); // Opcional: también limpio el carrito
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

/**
 * Muestra notificaciones temporales en la esquina de la pantalla
 * @param {string} message - mensaje a mostrar
 * @param {string} type - tipo de notificación ('success' o 'error')
 */
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Lo elimino automáticamente después de 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

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

// Agrego los estilos de animación necesarios para las notificaciones
const animationStyles = document.createElement("style");
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    @keyframes slideInScale {
        from {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
        }
        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }

    /* Estilos adicionales para mejorar la UX */
    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
    }

    .feature {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 20px var(--shadow);
        text-align: center;
    }

    .feature h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }

    .about-section {
        margin: 4rem 0;
    }

    .about-section h2 {
        text-align: center;
        color: var(--secondary-color);
        margin-bottom: 2rem;
        font-size: 2.5rem;
    }

    .newsletter-form {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .newsletter-form input {
        flex: 1;
        padding: 0.75rem;
        border: 2px solid var(--light-gray);
        border-radius: 8px;
        font-size: 1rem;
    }

    .newsletter-form input:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .newsletter-form button {
        padding: 0.75rem 1.5rem;
        white-space: nowrap;
    }

    @media (max-width: 768px) {
        .newsletter-form {
            flex-direction: column;
        }

        .features-grid {
            grid-template-columns: 1fr;
        }

        .about-section h2 {
            font-size: 2rem;
        }
    }
`;
document.head.appendChild(animationStyles);

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
    // Si estamos en la página de productos, usar la función específica
    if (window.location.pathname.includes("products.html")) {
      if (typeof performProductSearch === "function") {
        performProductSearch();
        return;
      }
    }

    // Si estamos en otra página, redirigir a productos con búsqueda
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

  // Inicializar menú responsive
  initResponsiveMenu();
}

/**
 * Inicializa la funcionalidad del menú responsive
 * Maneja el toggle del menú móvil y la animación de hamburguesa
 */
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
