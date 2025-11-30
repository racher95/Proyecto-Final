/**
 * Manejo de sesiones y verificación de estado de login
 */

document.addEventListener("componentsLoaded", function () {
  checkSessionStatus();
  enforceProfileGuard();
});

function checkSessionStatus() {
  const sessionData = checkSession();

  if (sessionData && sessionData.isLoggedIn) {
    updateUIForLoggedInUser(sessionData);
  } else {
    showLoginPrompt();
  }
}

function showLoginPrompt() {
  if (document.getElementById("loginPrompt")) return;

  const overlay = document.createElement("div");
  overlay.id = "loginPromptOverlay";
  overlay.className = "modal-overlay";

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

  overlay.appendChild(prompt);

  const closePromptBtn = prompt.querySelector("#closePromptBtn");
  const closePromptX = prompt.querySelector("#closePromptX");

  if (closePromptBtn) {
    closePromptBtn.addEventListener("click", closeLoginPrompt);
  }

  if (closePromptX) {
    closePromptX.addEventListener("click", closeLoginPrompt);
  }

  document.body.appendChild(overlay);

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeLoginPrompt();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeLoginPrompt();
    }
  });
}

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

function enforceProfileGuard() {
  const sessionData = checkSession();
  if (!sessionData || !sessionData.isLoggedIn) {
    return;
  }

  const currentPath = window.location.pathname;
  if (currentPath.includes("/profile.html")) {
    return;
  }

  const userData = AUTH_UTILS.getUserData();

  if (!isProfileComplete(userData)) {
    const profilePath = currentPath.includes("/pages/")
      ? "./profile.html"
      : "./pages/profile.html";

    window.location.href = profilePath;
  }
}
