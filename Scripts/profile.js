/**
 * Script para la página de perfil de usuario
 * Maneja la edición y persistencia del perfil con validaciones
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
 * Carga el perfil del usuario desde el backend
 */
async function loadUserProfile() {
  if (!AUTH_UTILS.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(API_CONFIG.USER_PROFILE, {
      method: "GET",
      headers: AUTH_UTILS.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error al cargar perfil");
    }

    const result = await response.json();

    // El backend devuelve directamente los datos (sin .data)
    currentProfile = result;

    // Adaptar estructura del backend a frontend
    currentProfile.username = currentProfile.username || currentUsername;

    // Calcular displayName desde firstName/first_name
    const firstName =
      currentProfile.firstName || currentProfile.first_name || "";
    const lastName = currentProfile.lastName || currentProfile.last_name || "";

    if (lastName && lastName.trim()) {
      currentProfile.displayName = `${firstName} ${lastName}`.trim();
    } else {
      currentProfile.displayName = firstName || currentProfile.username;
    }

    // Rellenar campos del formulario
    populateForm();

    // Actualizar estado del perfil
    updateProfileStatus();
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    showNotification("Error al cargar perfil", "error");
  }
}

/**
 * Rellena el formulario con los datos del perfil
 */
function populateForm() {
  // Username (readonly)
  document.getElementById("pfUsername").value =
    currentProfile.username || currentUsername;

  // First Name
  document.getElementById("pfFirstName").value =
    currentProfile.firstName || currentProfile.first_name || "";

  // Last Name
  document.getElementById("pfLastName").value =
    currentProfile.lastName || currentProfile.last_name || "";

  // Email
  document.getElementById("pfEmail").value = currentProfile.email || "";

  // Avatar - revisar todas las posibles variantes
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarUrl =
    currentProfile.avatar ||
    currentProfile.avatar_url ||
    currentProfile.avatarUrl ||
    currentProfile.avatarDataUrl;

  if (avatarUrl) {
    avatarPreview.src = avatarUrl;
    avatarPreview.classList.remove("avatar-placeholder");
  } else {
    // Usar placeholder generado por CSS
    avatarPreview.removeAttribute("src");
    avatarPreview.classList.add("avatar-placeholder");
    avatarPreview.setAttribute(
      "data-initials",
      getInitials(
        currentProfile.displayName ||
          currentProfile.firstName ||
          currentProfile.first_name ||
          currentProfile.username ||
          currentUsername
      )
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

  // Botón cambiar avatar
  changeAvatarBtn.addEventListener("click", () => {
    avatarFile.click();
  });

  // Click en el overlay del avatar
  avatarOverlay.addEventListener("click", () => {
    avatarFile.click();
  });

  // Click en la imagen para ampliar
  avatarPreview.addEventListener("click", (e) => {
    const avatarUrl = currentProfile.avatar || currentProfile.avatarDataUrl;
    if (avatarUrl) {
      e.stopPropagation();
      openImageModal(avatarUrl);
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
async function handleEditToggle() {
  const editBtn = document.getElementById("profileEditBtn");

  if (!isEditMode) {
    // Cambiar a modo edición
    enableEditMode();
    editBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    editBtn.classList.remove("btn-primary");
    editBtn.classList.add("btn-success");
  } else {
    // Deshabilitar botón durante guardado
    editBtn.disabled = true;
    editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    // Intentar guardar
    const saved = await validateAndSave();

    if (saved) {
      // Si guardó exitosamente, volver a modo lectura
      disableEditMode();
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Modificar';
      editBtn.classList.remove("btn-success");
      editBtn.classList.add("btn-primary");
    } else {
      // Si no validó, restaurar botón y mantener modo edición
      editBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    }

    editBtn.disabled = false;
  }
}

/**
 * Habilita el modo de edición
 */
function enableEditMode() {
  isEditMode = true;

  // Habilitar campos editables
  document.getElementById("pfFirstName").disabled = false;
  document.getElementById("pfLastName").disabled = false;
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
  document.getElementById("pfFirstName").disabled = true;
  document.getElementById("pfLastName").disabled = true;
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

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    showNotification("La imagen no puede superar los 5MB", "error");
    event.target.value = "";
    return;
  }

  // Validar tipo
  if (!file.type.startsWith("image/")) {
    showNotification("Solo se permiten archivos de imagen", "error");
    event.target.value = "";
    return;
  }

  try {
    // Mostrar loading
    const avatarPreview = document.getElementById("avatarPreview");
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    const originalBtnText = changeAvatarBtn.innerHTML;

    avatarPreview.style.opacity = "0.5";
    changeAvatarBtn.disabled = true;
    changeAvatarBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append("avatar", file);

    // Subir a Cloudinary vía backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/avatar`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${AUTH_UTILS.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al subir avatar");
    }

    const result = await response.json();

    // Actualizar preview con la URL de Cloudinary
    avatarPreview.src = result.avatarUrl;
    avatarPreview.classList.remove("avatar-placeholder");
    avatarPreview.removeAttribute("data-initials");
    avatarPreview.style.opacity = "1";

    // Actualizar perfil actual
    currentProfile.avatar = result.avatarUrl;

    // Actualizar sessionStorage para sincronizar con header y menú
    const userData = AUTH_UTILS.getUserData();
    if (userData) {
      userData.avatar = result.avatarUrl;
      AUTH_UTILS.saveUserData(userData);
    }

    const headerAvatars = document.querySelectorAll(".nav-avatar-img");
    headerAvatars.forEach((img) => {
      img.src = result.avatarUrl;
    });

    // Si existe la función global, también llamarla
    if (typeof updateUIForLoggedInUser === "function") {
      const session = checkSession();
      if (session) {
        updateUIForLoggedInUser(session);
      }
    }

    // Restaurar botón
    changeAvatarBtn.disabled = false;
    changeAvatarBtn.innerHTML = originalBtnText;

    showNotification("✅ Avatar actualizado exitosamente", "success");

    // Recargar perfil para asegurar sincronización
    await loadUserProfile();
  } catch (error) {
    console.error("Error al cargar imagen:", error);
    showNotification(error.message || "Error al subir avatar", "error");

    // Restaurar estado
    const avatarPreview = document.getElementById("avatarPreview");
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    avatarPreview.style.opacity = "1";
    changeAvatarBtn.disabled = false;
    changeAvatarBtn.innerHTML = '<i class="fas fa-camera"></i> Cambiar Foto';
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
async function validateAndSave() {
  // Validar email
  if (!validateEmail()) {
    showNotification("Por favor, corrige el email", "error");
    return false;
  }

  // Obtener valores del formulario
  const firstName = document.getElementById("pfFirstName").value.trim();
  const lastName = document.getElementById("pfLastName").value.trim();
  const email = document.getElementById("pfEmail").value.trim();

  // Validar que firstName no esté vacío
  if (!firstName) {
    showNotification("El nombre es requerido", "error");
    return false;
  }

  // Validar que lastName no esté vacío
  if (!lastName) {
    showNotification("El apellido es requerido", "error");
    return false;
  }

  try {
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
    };

    const response = await fetch(API_CONFIG.USER_PROFILE, {
      method: "PUT",
      headers: AUTH_UTILS.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar perfil");
    }

    const result = await response.json();

    // Recargar perfil desde backend
    await loadUserProfile();

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

// ===============================================
// GESTIÓN DE DIRECCIONES DE ENVÍO
// ===============================================

let currentAddresses = [];
let editingAddressId = null;

/**
 * Carga las direcciones del usuario desde el backend
 */
async function loadAddresses() {
  if (!AUTH_UTILS.isAuthenticated()) {
    return;
  }

  try {
    const response = await fetch(API_CONFIG.SHIPPING_ADDRESSES, {
      headers: AUTH_UTILS.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error al cargar direcciones");
    }

    currentAddresses = await response.json();
    renderAddresses();
  } catch (error) {
    console.error("Error al cargar direcciones:", error);
    document.getElementById("addressesList").innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="fas fa-exclamation-circle"></i> Error al cargar direcciones
      </div>
    `;
  }
}

/**
 * Renderiza la lista de direcciones
 */
function renderAddresses() {
  const addressesList = document.getElementById("addressesList");

  if (!currentAddresses || currentAddresses.length === 0) {
    addressesList.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="fas fa-map-marker-alt"></i> No tienes direcciones guardadas
      </div>
    `;
    return;
  }

  addressesList.innerHTML = currentAddresses
    .map(
      (addr) => `
    <div class="card mb-2 ${addr.is_default ? "border-primary" : ""}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            ${
              addr.is_default
                ? '<span class="badge bg-primary mb-2">Predeterminada</span>'
                : ""
            }
            <h6 class="mb-1">${addr.street} ${addr.number}</h6>
            <p class="text-muted small mb-1">
              ${addr.corner ? `Esq. ${addr.corner}` : ""}
              ${addr.department ? ` - ${addr.department}` : ""}
            </p>
            <p class="text-muted small mb-0">
              ${addr.city}, ${addr.state}, ${addr.country}
              ${addr.postal_code ? ` - CP: ${addr.postal_code}` : ""}
            </p>
          </div>
          <div class="btn-group btn-group-sm">
            ${
              !addr.is_default
                ? `
              <button
                class="btn btn-outline-primary"
                onclick="setDefaultAddress(${addr.id})"
                title="Marcar como predeterminada"
              >
                <i class="fas fa-star"></i>
              </button>
            `
                : ""
            }
            <button
              class="btn btn-outline-secondary"
              onclick="editAddress(${addr.id})"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-outline-danger"
              onclick="deleteAddress(${addr.id})"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Abre el modal para crear una nueva dirección
 */
function openAddressModal() {
  editingAddressId = null;
  document.getElementById("addressModalTitle").textContent = "Nueva Dirección";
  document.getElementById("addressForm").reset();
  document.getElementById("addressId").value = "";
  document.getElementById("country").value = "Uruguay";

  const modal = new bootstrap.Modal(document.getElementById("addressModal"));
  modal.show();
}

/**
 * Abre el modal para editar una dirección existente
 */
function editAddress(addressId) {
  const address = currentAddresses.find((a) => a.id === addressId);
  if (!address) return;

  editingAddressId = addressId;
  document.getElementById("addressModalTitle").textContent = "Editar Dirección";
  document.getElementById("addressId").value = addressId;
  document.getElementById("street").value = address.street || "";
  document.getElementById("number").value = address.number || "";
  document.getElementById("corner").value = address.corner || "";
  document.getElementById("department").value = address.department || "";
  document.getElementById("city").value = address.city || "";
  document.getElementById("state").value = address.state || "";
  document.getElementById("country").value = address.country || "Uruguay";
  document.getElementById("postalCode").value = address.postal_code || "";
  document.getElementById("isDefault").checked = address.is_default || false;

  const modal = new bootstrap.Modal(document.getElementById("addressModal"));
  modal.show();
}

/**
 * Guarda una dirección (crear o actualizar)
 */
async function saveAddress() {
  const addressData = {
    street: document.getElementById("street").value.trim(),
    number: document.getElementById("number").value.trim(),
    corner: document.getElementById("corner").value.trim(),
    department: document.getElementById("department").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    country: document.getElementById("country").value.trim(),
    postal_code: document.getElementById("postalCode").value.trim(),
    is_default: document.getElementById("isDefault").checked,
  };

  // Validaciones
  if (
    !addressData.street ||
    !addressData.number ||
    !addressData.city ||
    !addressData.state
  ) {
    showNotification("Por favor completa todos los campos requeridos", "error");
    return;
  }

  try {
    const saveBtn = document.getElementById("saveAddressBtn");
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    let response;
    if (editingAddressId) {
      // Actualizar dirección existente
      response = await fetch(
        `${API_CONFIG.SHIPPING_ADDRESSES}/${editingAddressId}`,
        {
          method: "PUT",
          headers: {
            ...AUTH_UTILS.getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressData),
        }
      );
    } else {
      // Crear nueva dirección
      response = await fetch(API_CONFIG.SHIPPING_ADDRESSES, {
        method: "POST",
        headers: {
          ...AUTH_UTILS.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al guardar dirección");
    }

    showNotification("✅ Dirección guardada exitosamente", "success");

    // Cerrar modal y recargar lista
    bootstrap.Modal.getInstance(document.getElementById("addressModal")).hide();
    await loadAddresses();
  } catch (error) {
    console.error("Error al guardar dirección:", error);
    showNotification(error.message || "Error al guardar dirección", "error");
  } finally {
    const saveBtn = document.getElementById("saveAddressBtn");
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
  }
}

/**
 * Elimina una dirección
 */
async function deleteAddress(addressId) {
  if (!confirm("¿Estás seguro de eliminar esta dirección?")) {
    return;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.SHIPPING_ADDRESSES}/${addressId}`,
      {
        method: "DELETE",
        headers: AUTH_UTILS.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar dirección");
    }

    showNotification("✅ Dirección eliminada", "success");
    await loadAddresses();
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    showNotification(error.message || "Error al eliminar dirección", "error");
  }
}

/**
 * Marca una dirección como predeterminada
 */
async function setDefaultAddress(addressId) {
  try {
    const response = await fetch(
      `${API_CONFIG.SHIPPING_ADDRESSES}/${addressId}`,
      {
        method: "PUT",
        headers: {
          ...AUTH_UTILS.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_default: true }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar dirección");
    }

    showNotification("✅ Dirección predeterminada actualizada", "success");
    await loadAddresses();
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    showNotification(error.message || "Error al actualizar dirección", "error");
  }
}

// ===============================================
// CAMBIAR CONTRASEÑA
// ===============================================

/**
 * Maneja el cambio de contraseña
 */
async function handleChangePassword(event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  // Validaciones
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showNotification("Por favor completa todos los campos", "error");
    return;
  }

  if (newPassword.length < 6) {
    showNotification(
      "La nueva contraseña debe tener al menos 6 caracteres",
      "error"
    );
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showNotification("Las contraseñas no coinciden", "error");
    return;
  }

  if (currentPassword === newPassword) {
    showNotification(
      "La nueva contraseña debe ser diferente a la actual",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/users/change-password`,
      {
        method: "POST",
        headers: {
          ...AUTH_UTILS.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al cambiar contraseña");
    }

    showNotification("✅ Contraseña cambiada exitosamente", "success");
    document.getElementById("changePasswordForm").reset();
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    showNotification(error.message || "Error al cambiar contraseña", "error");
  }
}

// ===============================================
// ELIMINAR CUENTA
// ===============================================

/**
 * Abre el modal de confirmación para eliminar cuenta
 */
function openDeleteAccountModal() {
  document.getElementById("deleteAccountPassword").value = "";
  const modal = new bootstrap.Modal(
    document.getElementById("deleteAccountModal")
  );
  modal.show();
}

/**
 * Confirma y ejecuta la eliminación de cuenta
 */
async function confirmDeleteAccount() {
  const password = document.getElementById("deleteAccountPassword").value;

  if (!password) {
    showNotification("Por favor ingresa tu contraseña", "error");
    return;
  }

  try {
    const confirmBtn = document.getElementById("confirmDeleteAccountBtn");
    confirmBtn.disabled = true;
    confirmBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/account`, {
      method: "DELETE",
      headers: {
        ...AUTH_UTILS.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar cuenta");
    }

    // Limpiar sesión y redirigir
    AUTH_UTILS.clearUserData();
    showNotification("Tu cuenta ha sido eliminada", "success");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    showNotification(error.message || "Error al eliminar cuenta", "error");

    const confirmBtn = document.getElementById("confirmDeleteAccountBtn");
    confirmBtn.disabled = false;
    confirmBtn.innerHTML =
      '<i class="fas fa-trash-alt"></i> Eliminar Mi Cuenta';
  }
}

// ===============================================
// TOGGLE PASSWORD VISIBILITY
// ===============================================

/**
 * Alterna la visibilidad de campos de contraseña
 */
function setupPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const icon = btn.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });
}

// ===============================================
// INICIALIZACIÓN ADICIONAL
// ===============================================

// Al cargar la página, también cargar direcciones y configurar eventos
document.addEventListener("DOMContentLoaded", function () {
  // Cargar direcciones si está autenticado
  if (AUTH_UTILS.isAuthenticated()) {
    loadAddresses();
  }

  // Configurar botones y eventos
  const addAddressBtn = document.getElementById("addAddressBtn");
  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", openAddressModal);
  }

  const saveAddressBtn = document.getElementById("saveAddressBtn");
  if (saveAddressBtn) {
    saveAddressBtn.addEventListener("click", saveAddress);
  }

  const changePasswordForm = document.getElementById("changePasswordForm");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", handleChangePassword);
  }

  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", openDeleteAccountModal);
  }

  const confirmDeleteAccountBtn = document.getElementById(
    "confirmDeleteAccountBtn"
  );
  if (confirmDeleteAccountBtn) {
    confirmDeleteAccountBtn.addEventListener("click", confirmDeleteAccount);
  }

  // Configurar toggles de contraseña
  setupPasswordToggles();
});
