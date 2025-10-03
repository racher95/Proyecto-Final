/**
 * Manejador de sesiones para Craftivity
 * Este script se carga en todas las páginas EXCEPTO login
 * Maneja la verificación de sesión y muestra el prompt de login
 */

// Esperar a que los componentes (header/footer) se carguen antes de verificar sesión
document.addEventListener("componentsLoaded", function () {
  // Verifico si el usuario está logueado y actualizo la UI
  checkSessionStatus();
});

/**
 * DESAFÍO IMPLEMENTADO: Verificación automática de sesión
 * Muestra un aviso elegante para invitar a usuarios no logueados a iniciar sesión
 * Solo aplica redirección forzada para páginas verdaderamente privadas
 */
function checkSessionStatus() {
  // Obtengo datos de sesión validando expiración (24 horas)
  const sessionData = checkSession();

  if (sessionData && sessionData.isLoggedIn) {
    // Usuario logueado - actualizar interfaz
    updateUIForLoggedInUser(sessionData);
  } else {
    // Usuario NO logueado - mostrar prompt elegante
    showLoginPrompt();
  }
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
