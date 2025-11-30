/**
 * Scripts/register.js
 * Maneja el registro de nuevos usuarios con upload de avatar
 */

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const avatarInput = document.getElementById("avatar");
  const avatarPreview = document.getElementById("avatarPreview");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  let selectedFile = null;

  // Preview de avatar
  avatarInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("La imagen no puede superar los 5MB", "error");
        avatarInput.value = "";
        return;
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        showNotification("Solo se permiten archivos de imagen", "error");
        avatarInput.value = "";
        return;
      }

      selectedFile = file;

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = function (event) {
        avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Indicador de fortaleza de contraseña
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const strengthIndicator = document.getElementById("passwordStrength");

    if (password.length === 0) {
      strengthIndicator.textContent = "";
      strengthIndicator.className = "password-strength";
      return;
    }

    let strength = 0;
    const feedback = [];

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      strength++;
      feedback.push("mayúsculas y minúsculas");
    }
    if (/\d/.test(password)) {
      strength++;
      feedback.push("números");
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      strength++;
      feedback.push("símbolos");
    }

    const strengthLevels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte"];
    const strengthClasses = ["very-weak", "weak", "fair", "good", "strong"];

    const level = Math.min(strength, 4);
    strengthIndicator.textContent = `Fortaleza: ${strengthLevels[level]}`;
    strengthIndicator.className = `password-strength ${strengthClasses[level]}`;
  });

  // Validar que las contraseñas coincidan
  confirmPasswordInput.addEventListener("input", function () {
    const error = document.getElementById("confirmPasswordError");
    if (this.value && this.value !== passwordInput.value) {
      error.textContent = "Las contraseñas no coinciden";
      this.setCustomValidity("Las contraseñas no coinciden");
    } else {
      error.textContent = "";
      this.setCustomValidity("");
    }
  });

  // Manejar envío del formulario
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Limpiar errores previos
    clearErrors();

    // Validaciones básicas
    const username = document.getElementById("username").value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const termsAccepted = document.getElementById("terms").checked;

    let hasErrors = false;

    if (!username) {
      showFieldError("usernameError", "El nombre de usuario es requerido");
      hasErrors = true;
    } else if (username.length < 3) {
      showFieldError(
        "usernameError",
        "El nombre de usuario debe tener al menos 3 caracteres"
      );
      hasErrors = true;
    }

    if (!firstName) {
      showFieldError("firstNameError", "El nombre es requerido");
      hasErrors = true;
    }

    if (!lastName) {
      showFieldError("lastNameError", "El apellido es requerido");
      hasErrors = true;
    }

    if (!email) {
      showFieldError("emailError", "El correo electrónico es requerido");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      showFieldError("emailError", "Ingresa un correo electrónico válido");
      hasErrors = true;
    }

    if (!password) {
      showFieldError("passwordError", "La contraseña es requerida");
      hasErrors = true;
    } else if (password.length < 6) {
      showFieldError(
        "passwordError",
        "La contraseña debe tener al menos 6 caracteres"
      );
      hasErrors = true;
    }

    if (!confirmPassword) {
      showFieldError("confirmPasswordError", "Debes confirmar tu contraseña");
      hasErrors = true;
    } else if (password !== confirmPassword) {
      showFieldError("confirmPasswordError", "Las contraseñas no coinciden");
      hasErrors = true;
    }

    if (!termsAccepted) {
      showFieldError("termsError", "Debes aceptar los términos y condiciones");
      hasErrors = true;
    }

    if (hasErrors) return;

    // Deshabilitar botón de envío
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      // Enviar registro
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: "POST",
        body: formData,
        // NO incluir Content-Type, el navegador lo establece automáticamente con boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la cuenta");
      }

      // Registro exitoso
      showNotification(
        "¡Cuenta creada exitosamente! Redirigiendo...",
        "success"
      );

      // Guardar token y usuario
      AUTH_UTILS.saveToken(data.data.token, false); // No recordar por defecto
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

      // Redireccionar a productos después de 2 segundos
      setTimeout(() => {
        window.location.href = "products.html";
      }, 2000);
    } catch (error) {
      console.error("Error en registro:", error);
      showNotification(error.message || "Error al crear la cuenta", "error");

      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  /**
   * Muestra error en un campo específico
   */
  function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Limpia todos los mensajes de error
   */
  function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((error) => {
      error.textContent = "";
    });
  }

  /**
   * Valida formato de email
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Muestra notificación visual
   */
  function showNotification(message, type = "info") {
    // Crear elemento de notificación
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      }"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => notification.classList.add("show"), 10);

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // Configurar toggles de contraseña
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", function () {
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
  });
});
