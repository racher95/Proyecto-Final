/**
 * Script para la página de perfil de usuario
 * Maneja la edición y persistencia del perfil con validaciones
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

// Estado global del formulario
let isEditMode = false;
let currentUsername = null;
let currentProfile = null;

/**
 * Inicialización cuando carga la página
 */
document.addEventListener("DOMContentLoaded", function () {
  // Verificar sesión
  const sessionData = checkSession();

  if (!sessionData || !sessionData.isLoggedIn) {
    // Si no hay sesión, redirigir a login
    console.warn("No hay sesión activa, redirigiendo a login");
    window.location.href = "login.html";
    return;
  }

  // Obtener usuario actual
  currentUsername = sessionData.usuario;

  // Cargar perfil del usuario
  loadUserProfile();

  // Configurar event listeners
  setupEventListeners();

  // Iniciar en modo lectura (deshabilitado)
  disableEditMode();
});

/**
 * Carga el perfil del usuario desde localStorage
 */
function loadUserProfile() {
  // Obtener o crear perfil
  currentProfile = getUserProfile(currentUsername);

  if (!currentProfile) {
    // Crear perfil inicial si no existe
    currentProfile = upsertUserProfile(currentUsername, {});
  }

  // Rellenar campos del formulario
  populateForm();

  // Actualizar estado del perfil
  updateProfileStatus();
}

/**
 * Rellena el formulario con los datos del perfil
 */
function populateForm() {
  // Username (readonly)
  document.getElementById("pfUsername").value = currentProfile.username;

  // Display Name
  document.getElementById("pfDisplayName").value =
    currentProfile.displayName || "";

  // Email
  document.getElementById("pfEmail").value = currentProfile.email || "";

  // Avatar
  const avatarPreview = document.getElementById("avatarPreview");
  const hasDataUrl =
    currentProfile.avatarDataUrl &&
    currentProfile.avatarDataUrl.startsWith("data:image");
  const avatarSource = hasDataUrl
    ? currentProfile.avatarDataUrl
    : currentProfile.avatarRemoteUrl || null;

  if (avatarSource) {
    avatarPreview.src = avatarSource;
    avatarPreview.classList.remove("avatar-placeholder");
  } else {
    // Usar placeholder generado por CSS
    avatarPreview.removeAttribute("src");
    avatarPreview.classList.add("avatar-placeholder");
    avatarPreview.setAttribute(
      "data-initials",
      getInitials(currentProfile.displayName || currentProfile.username)
    );
  }
}

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales (max 2 letras)
 */
function getInitials(name) {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Actualiza el indicador de estado del perfil
 */
function updateProfileStatus() {
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");
  const statusHint = document.getElementById("statusHint");

  const isComplete = isProfileComplete(currentProfile);

  if (isComplete) {
    statusIndicator.className =
      "alert alert-success d-inline-flex align-items-center gap-2";
    statusText.innerHTML =
      '<i class="fas fa-check-circle"></i> Perfil completo';
    statusHint.textContent = "✓ Tu perfil está completo y listo para usar";
  } else {
    statusIndicator.className =
      "alert alert-warning d-inline-flex align-items-center gap-2";
    statusText.innerHTML =
      '<i class="fas fa-exclamation-circle"></i> Perfil incompleto';

    // Determinar qué falta
    const missing = [];
    if (!currentProfile.email || currentProfile.email.trim() === "") {
      missing.push("email");
    }
    const hasAvatar =
      (currentProfile.avatarDataUrl &&
        currentProfile.avatarDataUrl.startsWith("data:image")) ||
      (currentProfile.avatarRemoteUrl &&
        currentProfile.avatarRemoteUrl.startsWith("http"));

    if (!hasAvatar) {
      missing.push("foto de perfil");
    }

    if (missing.length > 0) {
      statusHint.textContent = `Falta: ${missing.join(" y ")}`;
    }
  }
}

/**
 * Configura los event listeners del formulario
 */
function setupEventListeners() {
  const editBtn = document.getElementById("profileEditBtn");
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const avatarFile = document.getElementById("avatarFile");
  const avatarOverlay = document.getElementById("avatarOverlay");
  const avatarPreview = document.getElementById("avatarPreview");

  // Botón Modificar/Guardar
  editBtn.addEventListener("click", handleEditToggle);

  // Botón cambiar avatar (solo funciona en modo edición)
  changeAvatarBtn.addEventListener("click", () => {
    if (isEditMode) {
      avatarFile.click();
    }
  });

  // Click en el overlay del avatar (solo en modo edición)
  avatarOverlay.addEventListener("click", () => {
    if (isEditMode) {
      avatarFile.click();
    }
  });

  // Click en la imagen para ampliar (solo si no está en modo edición)
  avatarPreview.addEventListener("click", (e) => {
    // Si está en modo edición, el overlay maneja el click
    if (!isEditMode && currentProfile.avatarDataUrl) {
      e.stopPropagation();
      openImageModal(currentProfile.avatarDataUrl);
    }
  });

  // Cambio de archivo de avatar
  avatarFile.addEventListener("change", handleAvatarChange);

  // Validación en tiempo real del email
  const emailInput = document.getElementById("pfEmail");
  emailInput.addEventListener("blur", validateEmail);
  emailInput.addEventListener("input", () => {
    const emailError = document.getElementById("emailError");
    emailError.classList.add("d-none");
    emailInput.classList.remove("is-invalid", "is-valid");
  });
}

/**
 * Maneja el toggle entre modo lectura y edición
 */
function handleEditToggle() {
  const editBtn = document.getElementById("profileEditBtn");

  if (!isEditMode) {
    // Cambiar a modo edición
    enableEditMode();
    editBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    editBtn.classList.remove("btn-primary");
    editBtn.classList.add("btn-success");
  } else {
    // Intentar guardar
    if (validateAndSave()) {
      // Si guardó exitosamente, volver a modo lectura
      disableEditMode();
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Modificar';
      editBtn.classList.remove("btn-success");
      editBtn.classList.add("btn-primary");
    }
    // Si no validó, mantener modo edición
  }
}

/**
 * Habilita el modo de edición
 */
function enableEditMode() {
  isEditMode = true;

  // Habilitar campos editables
  document.getElementById("pfDisplayName").disabled = false;
  document.getElementById("pfEmail").disabled = false;
  document.getElementById("changeAvatarBtn").disabled = false;

  // Agregar clase visual
  document.getElementById("profileForm").classList.add("edit-mode");

  // Habilitar interacción del avatar
  const avatarWrapper = document.querySelector(".avatar-preview-wrapper");
  avatarWrapper.classList.add("editable");
}

/**
 * Deshabilita el modo de edición
 */
function disableEditMode() {
  isEditMode = false;

  // Deshabilitar campos
  document.getElementById("pfDisplayName").disabled = true;
  document.getElementById("pfEmail").disabled = true;
  document.getElementById("changeAvatarBtn").disabled = true;

  // Remover clase visual
  document.getElementById("profileForm").classList.remove("edit-mode");

  // Deshabilitar interacción del avatar
  const avatarWrapper = document.querySelector(".avatar-preview-wrapper");
  avatarWrapper.classList.remove("editable");
}

/**
 * Maneja el cambio de archivo de avatar
 */
async function handleAvatarChange(event) {
  const file = event.target.files[0];

  if (!file) return;

  try {
    // Mostrar loading
    const avatarPreview = document.getElementById("avatarPreview");
    const originalSrc = avatarPreview.src;
    avatarPreview.style.opacity = "0.5";

    // Leer imagen como DataURL
    const imageData = await readImageAsDataURL(file);

    // Actualizar preview - remover placeholder si existía
    avatarPreview.src = imageData.dataUrl;
    avatarPreview.classList.remove("avatar-placeholder");
    avatarPreview.removeAttribute("data-initials");
    avatarPreview.style.opacity = "1";

    // Guardar temporalmente en el perfil (no persiste hasta "Guardar")
    currentProfile.avatarDataUrl = imageData.dataUrl;
    currentProfile.avatarFileName = imageData.fileName;
    currentProfile.avatarSize = imageData.size;
    currentProfile.avatarRemoteUrl = null;
    currentProfile.avatarHash = null;

    showNotification(
      "Foto cargada. Haz clic en Guardar para confirmar.",
      "info"
    );
  } catch (error) {
    console.error("Error al cargar imagen:", error);
    showNotification(error.message, "error");

    // Restaurar preview anterior
    event.target.value = "";
  }
}

/**
 * Valida el campo de email
 * @returns {boolean} true si es válido
 */
function validateEmail() {
  const emailInput = document.getElementById("pfEmail");
  const emailError = document.getElementById("emailError");
  const email = emailInput.value.trim();

  // Validar que no esté vacío
  if (!email) {
    emailError.textContent = "El email es obligatorio";
    emailError.classList.remove("d-none");
    emailInput.classList.add("is-invalid");
    return false;
  }

  // Validar formato
  if (!isValidEmail(email)) {
    emailError.textContent = "Email inválido. Ejemplo: usuario@mail.com";
    emailError.classList.remove("d-none");
    emailInput.classList.add("is-invalid");
    return false;
  }

  // Email válido
  emailError.classList.add("d-none");
  emailInput.classList.remove("is-invalid");
  emailInput.classList.add("is-valid");
  return true;
}

/**
 * Valida todo el formulario y guarda si es válido
 * @returns {boolean} true si guardó exitosamente
 */
function validateAndSave() {
  console.log("=== validateAndSave: Iniciando validación ===");

  // Validar email
  if (!validateEmail()) {
    showNotification("Por favor, corrige el email", "error");
    return false;
  }

  // Validar que tenga avatar
  const hasAvatarData =
    currentProfile.avatarDataUrl &&
    currentProfile.avatarDataUrl.startsWith("data:image");
  const hasRemoteAvatar =
    currentProfile.avatarRemoteUrl &&
    currentProfile.avatarRemoteUrl.startsWith("http");

  if (!hasAvatarData && !hasRemoteAvatar) {
    showNotification("Por favor, selecciona una foto de perfil", "error");
    return false;
  }

  // Obtener valores del formulario
  const displayName = document.getElementById("pfDisplayName").value.trim();
  const email = document.getElementById("pfEmail").value.trim();

  console.log("Datos a guardar:", {
    username: currentUsername,
    displayName,
    email,
    hasAvatar: hasAvatarData || hasRemoteAvatar,
  });

  try {
    // Guardar perfil actualizado
    const updatedProfile = upsertUserProfile(currentUsername, {
      displayName: displayName || currentUsername,
      email: email,
      avatarDataUrl: currentProfile.avatarDataUrl,
      avatarFileName: currentProfile.avatarFileName,
      avatarSize: currentProfile.avatarSize,
      avatarRemoteUrl: currentProfile.avatarRemoteUrl,
      avatarHash: currentProfile.avatarHash,
    });

    console.log("Perfil guardado en localStorage:", updatedProfile);

    // Verificar que realmente se guardó
    const verification = getUserProfile(currentUsername);
    console.log("Verificación después de guardar:", verification);

    // Recargar perfil
    loadUserProfile();

    // Mostrar notificación de éxito
    showNotification("✅ Perfil guardado exitosamente", "success");

    return true;
  } catch (error) {
    console.error("Error guardando perfil:", error);
    showNotification("Error al guardar: " + error.message, "error");
    return false;
  }
}

/**
 * Abre un modal Bootstrap para ver la imagen en tamaño completo
 * @param {string} imageUrl - URL de la imagen (data URL o URL externa)
 */
function openImageModal(imageUrl) {
  // Obtener elementos del modal
  const modalElement = document.getElementById("avatarModal");
  const modalImage = document.getElementById("avatarModalImage");

  if (!modalElement || !modalImage) {
    console.error("Modal de avatar no encontrado en el DOM");
    return;
  }

  // Establecer la imagen
  modalImage.src = imageUrl;

  // Crear y mostrar el modal usando Bootstrap
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}
