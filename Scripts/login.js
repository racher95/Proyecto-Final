/**
 * Sistema de autenticación
 */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    return;
  }

  const usuarioInput = document.getElementById("usuario");
  const contraseñaInput = document.getElementById("contraseña");
  const usuarioError = document.getElementById("usuarioError");
  const contraseñaError = document.getElementById("contraseñaError");

  // Evento que se ejecuta cuando el usuario envía el formulario
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Evito que la página se recargue

    // Limpio cualquier mensaje de error anterior
    clearErrors();

    // Verifico que todos los campos estén correctos
    const isValid = validateForm();

    if (isValid) {
      const usuario = usuarioInput.value.trim();
      const contraseña = contraseñaInput.value.trim();
      const rememberMe =
        document.getElementById("rememberMe")?.checked || false;

      // Deshabilitar botón durante la petición
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Iniciando sesión...";

      try {
        // Llamar al backend para autenticación
        const response = await fetch(API_CONFIG.AUTH_LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: usuario,
            password: contraseña,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Guardar token JWT (sessionStorage o localStorage según "recordarme")
          AUTH_UTILS.saveToken(data.data.token, rememberMe);

          // Guardar datos del usuario en sessionStorage
          AUTH_UTILS.saveUserData({
            userId: data.data.userId,
            username: data.data.username,
            email: data.data.email,
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            avatar: data.data.avatar,
            theme: data.data.theme || "light",
            loginTime: new Date().toISOString(),
          });

          // Migrar carrito temporal al usuario autenticado
          await migrateCartToBackend(data.data.userId);

          // Mensaje de éxito
          showSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...");

          // Redirigir a la página principal
          setTimeout(() => {
            window.location.href = "../index.html";
          }, 1500);
        } else {
          // Error de credenciales
          showFieldError(
            "contraseña",
            data.message || "Usuario o contraseña incorrectos"
          );
          showNotification(
            data.message || "Usuario o contraseña incorrectos",
            "error"
          );
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      } catch (error) {
        console.error("Error en login:", error);
        showFieldError(
          "contraseña",
          "Error de conexión. Verifica que el servidor esté activo."
        );
        showNotification(
          "Error de conexión con el servidor. Verifica que esté activo en el puerto 3000.",
          "error"
        );
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
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

  async function migrateCartToBackend(userId) {
    try {
      const localCart = localStorage.getItem("craftivityCart");

      if (!localCart) {
        return;
      }

      const cartItems = JSON.parse(localCart);

      if (cartItems.length === 0) {
        return;
      }

      const token = AUTH_UTILS.getToken();

      for (const item of cartItems) {
        const response = await fetch(API_CONFIG.CART_ITEMS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
          }),
        });

        await response.json();
      }

      localStorage.removeItem("craftivityCart");
    } catch (error) {
      console.error("Error migrando carrito:", error);
    }
  }

  // Configurar toggle de contraseña
  const togglePasswordBtn = document.querySelector(".toggle-password");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  }
});
