/**
 * Sistema de autenticación para Craftivity
 * Maneja el login, validaciones y gestión de sesiones
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function () {
  // Obtengo las referencias a los elementos del formulario
  const loginForm = document.getElementById("loginForm");
  const usuarioInput = document.getElementById("usuario");
  const contraseñaInput = document.getElementById("contraseña");
  const usuarioError = document.getElementById("usuarioError");
  const contraseñaError = document.getElementById("contraseñaError");

  // Evento que se ejecuta cuando el usuario envía el formulario
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Evito que la página se recargue

    // Limpio cualquier mensaje de error anterior
    clearErrors();

    // Verifico que todos los campos estén correctos
    const isValid = validateForm();

    if (isValid) {
      // Como es un proyecto académico, acepto cualquier credencial válida
      const usuario = usuarioInput.value.trim();
      const contraseña = contraseñaInput.value.trim();

      // Creo un objeto con los datos de la sesión
      const sessionData = {
        usuario: usuario,
        loginTime: new Date().toISOString(), // Guardo cuándo se logeó
        isLoggedIn: true,
      };

      // Guardo la sesión en el navegador para que persista
      localStorage.setItem("craftivitySession", JSON.stringify(sessionData));

      // Muestro un mensaje de éxito al usuario
      showSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...");

      // Redirijo a la página principal después de 1.5 segundos
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    }
  });

  // Validación en tiempo real - cuando el usuario sale de un campo
  usuarioInput.addEventListener("blur", validateUsuario);
  contraseñaInput.addEventListener("blur", validateContraseña);

  // Limpio errores mientras el usuario escribe
  usuarioInput.addEventListener("input", () => clearFieldError("usuario"));
  contraseñaInput.addEventListener("input", () =>
    clearFieldError("contraseña")
  );

  /**
   * Valida todo el formulario
   * @returns {boolean} true si es válido, false si hay errores
   */
  function validateForm() {
    const usuarioValid = validateUsuario();
    const contraseñaValid = validateContraseña();

    return usuarioValid && contraseñaValid;
  }

  /**
   * Valida el campo de usuario
   * @returns {boolean} true si es válido
   */
  function validateUsuario() {
    const usuario = usuarioInput.value.trim();

    // Verifico que no esté vacío
    if (!usuario) {
      showFieldError("usuario", "El nombre de usuario es obligatorio");
      return false;
    }

    // Verifico que tenga al menos 3 caracteres
    if (usuario.length < 3) {
      showFieldError("usuario", "El usuario debe tener al menos 3 caracteres");
      return false;
    }

    // Si llegó hasta acá, está todo bien
    clearFieldError("usuario");
    return true;
  }

  /**
   * Valida el campo de contraseña
   * @returns {boolean} true si es válido
   */
  function validateContraseña() {
    const contraseña = contraseñaInput.value.trim();

    if (!contraseña) {
      showFieldError("contraseña", "La contraseña es obligatoria");
      return false;
    }

    if (contraseña.length < 4) {
      showFieldError(
        "contraseña",
        "La contraseña debe tener al menos 4 caracteres"
      );
      return false;
    }

    clearFieldError("contraseña");
    return true;
  }

  /**
   * Muestra un mensaje de error debajo del campo
   * @param {string} field - nombre del campo (usuario o contraseña)
   * @param {string} message - mensaje a mostrar
   */
  function showFieldError(field, message) {
    const input = document.getElementById(field);
    const errorDiv = document.getElementById(field + "Error");

    input.classList.add("error"); // Agrego clase CSS para resaltar en rojo
    errorDiv.textContent = message;
  }

  /**
   * Limpia el error de un campo específico
   * @param {string} field - nombre del campo a limpiar
   */
  function clearFieldError(field) {
    const input = document.getElementById(field);
    const errorDiv = document.getElementById(field + "Error");

    input.classList.remove("error");
    errorDiv.textContent = "";
  }

  /**
   * Limpia todos los errores del formulario
   */
  function clearErrors() {
    clearFieldError("usuario");
    clearFieldError("contraseña");
  }

  /**
   * Muestra un mensaje de éxito temporal en la esquina superior derecha
   * @param {string} message - mensaje a mostrar
   */
  function showSuccessMessage(message) {
    // Creo un elemento div para el mensaje
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;

    document.body.appendChild(successDiv);

    // Lo elimino automáticamente después de 3 segundos
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  }
});

/**
 * Verifica si el usuario tiene una sesión activa
 * @returns {object|null} datos de la sesión si está activa, null si no
 */
function checkSession() {
  const sessionData = getSessionData();

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
 * Función para proteger páginas - redirige al login si no hay sesión
 * Se puede llamar desde cualquier página que requiera autenticación
 */
function redirectIfNotLoggedIn() {
  const session = checkSession();
  if (!session) {
    // Si estamos en una subcarpeta (pages/), ajusto la ruta
    const isInSubfolder = window.location.pathname.includes("/pages/");
    const loginPath = isInSubfolder ? "login.html" : "pages/login.html";
    window.location.href = loginPath;
  }
  return session;
}
