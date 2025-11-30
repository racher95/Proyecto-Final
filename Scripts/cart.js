/**
 * Gestión del carrito de compras de Craftivity
 * Maneja visualización, modificación y cálculos del carrito
 *
 * Nota: Utiliza showNotification() y updateCartCounter() de main.js
 * para mantener consistencia y evitar duplicación de código.
 */

// Cuando carga la página del carrito, lo inicializo
document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  setupCheckoutListeners();
  loadShippingAddresses(); // Cargar direcciones desde backend
});

// Configurar listeners del checkout
// Prepara todos los botones y campos para que respondan a clicks/cambios
function setupCheckoutListeners() {
  const checkoutButton = document.getElementById("checkoutButton");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", checkout);
  }

  // Event delegation: un solo listener en el contenedor para todos los botones (+, -, eliminar)
  const cartItems = document.getElementById("cartItems");
  if (cartItems) {
    cartItems.addEventListener("click", function (e) {
      const itemId = e.target.getAttribute("data-item-id");

      if (e.target.classList.contains("quantity-btn")) {
        e.preventDefault();
        const newQuantity = parseInt(e.target.getAttribute("data-quantity"));
        updateQuantity(parseInt(itemId), newQuantity);
      }

      if (e.target.classList.contains("remove-btn")) {
        e.preventDefault();
        removeFromCart(parseInt(itemId));
      }
    });
  }

  // Cuando cambia el tipo de envío, recalcula el costo total
  const shippingRadios = document.querySelectorAll(
    'input[name="shippingType"]'
  );
  shippingRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const cart = getCart();
      updateCartSummary(cart);
    });
  });

  // Si cambia la forma de pago, muestra/oculta los campos de tarjeta
  const paymentRadios = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", togglePaymentFields);
  });
}

// Mostrar/ocultar campos según forma de pago seleccionada
// Si elige tarjeta → muestra campos de tarjeta, si elige transferencia → muestra datos bancarios
function togglePaymentFields() {
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );
  const creditFields = document.getElementById("creditCardFields");
  const transferInfo = document.getElementById("transferInfo");

  if (!paymentMethod) return;

  if (paymentMethod.value === "credit") {
    creditFields.style.display = "block";
    transferInfo.style.display = "none";
  } else if (paymentMethod.value === "transfer") {
    creditFields.style.display = "none";
    transferInfo.style.display = "block";
  }
}

// Cargar direcciones guardadas desde el backend
let userAddresses = [];
let selectedAddressId = null;

async function loadShippingAddresses() {
  if (!AUTH_UTILS.isAuthenticated()) {
    // Usuario no logueado: mostrar solo formulario manual
    document.getElementById("saveAddressOption").style.display = "block";
    return;
  }

  try {
    const response = await fetch(API_CONFIG.SHIPPING_ADDRESSES, {
      headers: AUTH_UTILS.getAuthHeaders(),
    });

    if (!response.ok) {
      // Si falla, mostrar formulario manual
      document.getElementById("saveAddressOption").style.display = "block";
      return;
    }

    userAddresses = await response.json();

    if (userAddresses && userAddresses.length > 0) {
      // Mostrar selector de direcciones
      document.getElementById("savedAddressesSection").style.display = "block";

      // Poblar selector
      const selector = document.getElementById("addressSelector");
      selector.innerHTML =
        '<option value="">Selecciona una dirección...</option>';

      userAddresses.forEach((addr) => {
        const option = document.createElement("option");
        option.value = addr.id;
        option.textContent = `${addr.street} ${addr.number}, ${addr.city}${
          addr.is_default ? " (Predeterminada)" : ""
        }`;
        selector.appendChild(option);
      });

      selector.innerHTML += '<option value="new">+ Nueva dirección</option>';

      // Listener para cambio de dirección
      selector.addEventListener("change", handleAddressSelection);

      // Auto-seleccionar dirección predeterminada
      const defaultAddr = userAddresses.find((a) => a.is_default);
      if (defaultAddr) {
        selector.value = defaultAddr.id;
        populateAddressForm(defaultAddr);
        selectedAddressId = defaultAddr.id;
        document.getElementById("addressFormSection").style.display = "none";
      }
    } else {
      // No tiene direcciones: mostrar formulario con opción de guardar
      document.getElementById("saveAddressOption").style.display = "block";
    }
  } catch (error) {
    console.error("Error al cargar direcciones:", error);
    // Mostrar formulario manual si falla
    document.getElementById("saveAddressOption").style.display = "block";
  }
}

function handleAddressSelection(event) {
  const addressId = event.target.value;

  if (addressId === "new") {
    // Nueva dirección: mostrar formulario vacío
    selectedAddressId = null;
    document.getElementById("addressFormSection").style.display = "block";
    document.getElementById("saveAddressOption").style.display = "block";
    clearAddressForm();
  } else if (addressId) {
    // Dirección existente: ocultar formulario y marcar como seleccionada
    const address = userAddresses.find((a) => a.id == addressId);
    if (address) {
      selectedAddressId = address.id;
      populateAddressForm(address);
      document.getElementById("addressFormSection").style.display = "none";
      document.getElementById("saveAddressOption").style.display = "none";
    }
  } else {
    // No seleccionó nada: mostrar formulario vacío
    selectedAddressId = null;
    document.getElementById("addressFormSection").style.display = "block";
    document.getElementById("saveAddressOption").style.display = "block";
    clearAddressForm();
  }
}

function populateAddressForm(address) {
  document.getElementById("state").value = address.state || "";
  document.getElementById("city").value = address.city || "";
  document.getElementById("street").value = address.street || "";
  document.getElementById("number").value = address.number || "";
  document.getElementById("corner").value = address.corner || "";
  document.getElementById("department").value = address.department || "";
  document.getElementById("postalCode").value = address.postal_code || "";
}

function clearAddressForm() {
  document.getElementById("state").value = "";
  document.getElementById("city").value = "";
  document.getElementById("street").value = "";
  document.getElementById("number").value = "";
  document.getElementById("corner").value = "";
  document.getElementById("department").value = "";
  document.getElementById("postalCode").value = "";
  document.getElementById("saveAddress").checked = false;
}

/**
 * Carga y muestra el contenido del carrito desde localStorage
 */
/**
 * Carga el carrito desde el backend (si hay sesión) o localStorage
 * Si el usuario está logueado, obtiene el carrito del backend
 * Si no, usa el carrito temporal de localStorage
 */
async function loadCart() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContent = document.getElementById("cartContent");

  let cart = [];

  // Verificar si hay sesión activa
  if (AUTH_UTILS.isAuthenticated()) {
    // Usuario logueado: cargar desde backend
    try {
      const response = await fetch(API_CONFIG.CART, {
        headers: AUTH_UTILS.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();

        // Backend devuelve {cartId, items, total, itemCount}
        // Adaptar estructura: backend usa 'price' y 'productId', frontend espera 'cost' e 'id'
        cart = (data.items || []).map((item) => ({
          id: item.productId || item.id, // ID del producto
          cartItemId: item.id, // ID del item en cart_items
          name: item.name,
          cost: item.price || item.cost,
          currency: item.currency,
          quantity: item.quantity,
          image: item.image,
          subtotal: item.subtotal,
        }));
      } else {
        console.error("Error cargando carrito del backend");
        showNotification("Error al cargar el carrito", "error");
      }
    } catch (error) {
      console.error("Error conectando con el backend:", error);
      showNotification("Error de conexión con el servidor", "error");
    }
  } else {
    // Sin sesión: usar carrito local
    cart = getCart();
  }

  // Mostrar carrito vacío o contenido
  if (cart.length === 0) {
    if (emptyCart) emptyCart.classList.add("show");
    if (cartContent) cartContent.classList.remove("show");
  } else {
    if (emptyCart) emptyCart.classList.remove("show");
    if (cartContent) cartContent.classList.add("show");
    displayCartItems(cart);
    updateCartSummary(cart);
  }
}

// Genera y renderiza el HTML de los productos en el carrito
function displayCartItems(cart) {
  const cartItems = document.getElementById("cartItems");

  // Genero el HTML para cada producto en el carrito
  const itemsHTML = cart
    .map((item) => {
      // Para backend usamos cartItemId, para localStorage usamos id
      const itemIdentifier = item.cartItemId || item.id;
      return `
        <div class="cart-item" data-item-id="${itemIdentifier}">
            <img src="${item.image}" alt="${
        item.name
      }" class="cart-item-image" onerror="this.src='../img/placeholder.jpg'">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatCurrency(
                  item.cost || 0,
                  item.currency || "UYU"
                )}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease" data-item-id="${itemIdentifier}" data-quantity="${
        item.quantity - 1
      }">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-item-id="${itemIdentifier}" data-quantity="${
        item.quantity + 1
      }">+</button>
            </div>
            <div class="cart-item-total">
                ${formatCurrency(
                  (item.cost || 0) * item.quantity,
                  item.currency || "UYU"
                )}
            </div>
            <button class="remove-btn" data-item-id="${itemIdentifier}" title="Eliminar producto">🗑️</button>
        </div>
    `;
    })
    .join("");

  // Inserto el HTML en el contenedor
  cartItems.innerHTML = itemsHTML;
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * Si la cantidad es menor a 1, elimina el producto del carrito
 * @param {number} itemId - Para backend: cartItemId, para localStorage: productId
 */
async function updateQuantity(itemId, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(itemId);
    return;
  }

  if (AUTH_UTILS.isAuthenticated()) {
    // Usuario logueado: actualizar en backend usando cartItemId
    try {
      const response = await fetch(`${API_CONFIG.CART_ITEMS}/${itemId}`, {
        method: "PUT",
        headers: AUTH_UTILS.getAuthHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        await loadCart(); // Recargar carrito
        updateCartCounter();
        showNotification("Cantidad actualizada", "success");
      } else {
        showNotification("Error al actualizar cantidad", "error");
      }
    } catch (error) {
      console.error("Error actualizando cantidad:", error);
      showNotification("Error de conexión", "error");
    }
  } else {
    // Sin sesión: actualizar carrito local usando productId
    let cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity = newQuantity;
      saveCart(cart);
      loadCart();
      updateCartCounter();
    }
  }
}

/**
 * Elimina un producto del carrito
 */
/**
 * Elimina un producto del carrito
 * @param {number} itemId - Para backend: cartItemId, para localStorage: productId
 */
async function removeFromCart(itemId) {
  if (AUTH_UTILS.isAuthenticated()) {
    // Usuario logueado: eliminar del backend usando cartItemId
    try {
      const response = await fetch(`${API_CONFIG.CART_ITEMS}/${itemId}`, {
        method: "DELETE",
        headers: AUTH_UTILS.getAuthHeaders(),
      });

      if (response.ok) {
        await loadCart();
        updateCartCounter();
        showNotification("Producto eliminado del carrito", "success");
      } else {
        showNotification("Error al eliminar producto", "error");
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      showNotification("Error de conexión", "error");
    }
  } else {
    // Sin sesión: eliminar de carrito local usando productId
    let cart = getCart();
    cart = cart.filter((item) => item.id !== itemId);
    saveCart(cart);
    loadCart();
    updateCartCounter();
    showNotification("Producto eliminado del carrito", "success");
  }
}

/**
 * Calcula y actualiza el resumen de precios
 * Incluye subtotal, IVA, costo de envío y total
 */
function updateCartSummary(cart) {
  // Suma el precio * cantidad de todos los productos
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.cost || 0) * (item.quantity || 0);
  }, 0);

  // Obtiene el tipo de envío para calcular su costo
  const shippingTypeRadio = document.querySelector(
    'input[name="shippingType"]:checked'
  );
  const shippingType = shippingTypeRadio ? shippingTypeRadio.value : "express";

  // Calcular costo de envío según porcentaje (premium 15%, express 7%, standard 5%)
  const shippingPercentage =
    CART_CONFIG.SHIPPING_OPTIONS[shippingType].percentage;
  const shippingCost = subtotal * shippingPercentage;

  const ivaRate = CART_CONFIG.TAX_RATE;
  const iva = subtotal * ivaRate;
  const total = subtotal + iva + shippingCost;

  // Actualizar los elementos del DOM con los valores calculados
  const subtotalElement = document.getElementById("subtotal");
  const ivaElement = document.getElementById("iva");
  const shippingElement = document.getElementById("shipping");
  const totalElement = document.getElementById("total");

  if (subtotalElement) {
    subtotalElement.textContent = formatCurrency(subtotal, "UYU");
  }

  if (ivaElement) {
    ivaElement.textContent = formatCurrency(iva, "UYU");
  }

  if (shippingElement) {
    shippingElement.textContent = formatCurrency(shippingCost, "UYU");
  }

  if (totalElement) {
    totalElement.textContent = formatCurrency(total, "UYU");
  }
}

/**
 * Inicia el proceso de checkout
 * Valida todos los campos y procesa la compra
 */
/**
 * Finaliza la compra creando una orden en el backend
 */
async function checkout() {
  // Validar que el usuario esté logueado
  if (!AUTH_UTILS.isAuthenticated()) {
    showNotification("Debes iniciar sesión para finalizar la compra", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // Obtener datos de dirección
  const state = document.getElementById("state").value.trim();
  const city = document.getElementById("city").value.trim();
  const street = document.getElementById("street").value.trim();
  const number = document.getElementById("number").value.trim();
  const corner = document.getElementById("corner").value.trim();
  const department = document.getElementById("department").value.trim();
  const postalCode = document.getElementById("postalCode").value.trim();

  // Validar campos requeridos
  if (!state || !city || !street || !number) {
    showNotification(
      "Debes completar los campos de dirección (departamento, ciudad, calle, número)",
      "error"
    );
    return;
  }

  // Si seleccionó "guardar dirección" y es una dirección nueva
  if (
    AUTH_UTILS.isAuthenticated() &&
    document.getElementById("saveAddress")?.checked &&
    !selectedAddressId
  ) {
    try {
      const addressData = {
        street,
        number,
        corner: corner || null,
        department: department || null,
        city,
        state,
        country: "Uruguay",
        postal_code: postalCode || null,
        is_default: userAddresses.length === 0, // Primera dirección es default
      };

      const response = await fetch(API_CONFIG.SHIPPING_ADDRESSES, {
        method: "POST",
        headers: {
          ...AUTH_UTILS.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        const result = await response.json();
        selectedAddressId = result.addressId || result.id || result.data?.id;
      } else {
        const errorData = await response.json();
        console.error("Error al guardar dirección:", errorData);
        // Continuar con el checkout aunque falle guardar la dirección
      }
    } catch (error) {
      console.error("Error al guardar dirección:", error);
      // Continuar con el checkout aunque falle guardar la dirección
    }
  }

  // Validar forma de pago seleccionada
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );
  if (!paymentMethod) {
    showNotification("Debes seleccionar una forma de pago", "error");
    return;
  }

  // Si elige pago con tarjeta, validar campos
  if (paymentMethod.value === "credit") {
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const cardHolder = document.getElementById("cardHolder").value.trim();
    const cardExpiry = document.getElementById("cardExpiry").value.trim();
    const cardCVV = document.getElementById("cardCVV").value.trim();

    if (!cardNumber || !cardHolder || !cardExpiry || !cardCVV) {
      showNotification(
        "Debes completar todos los datos de la tarjeta",
        "error"
      );
      return;
    }

    if (
      cardNumber.length < 13 ||
      cardNumber.length > 16 ||
      !/^\d+$/.test(cardNumber)
    ) {
      showNotification("Número de tarjeta inválido", "error");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      showNotification("Formato de vencimiento inválido (usar MM/AA)", "error");
      return;
    }

    if (cardCVV.length < 3 || cardCVV.length > 4 || !/^\d+$/.test(cardCVV)) {
      showNotification("CVV inválido", "error");
      return;
    }
  }

  // Deshabilitar botón durante la creación
  const checkoutButton = document.getElementById("checkoutButton");
  const originalText = checkoutButton.textContent;
  checkoutButton.disabled = true;
  checkoutButton.textContent = "Procesando...";

  try {
    // Crear orden en el backend
    const orderData = {
      shippingAddress: {
        department: state, // Mapear state -> department
        locality: city, // Mapear city -> locality
        street,
        number,
        corner: corner || "",
        apartment: department || "", // Apartamento
      },
      paymentMethod: paymentMethod.value,
    };

    // Si se seleccionó una dirección guardada, incluir su ID
    if (selectedAddressId) {
      orderData.shippingAddressId = selectedAddressId;
    }

    const response = await fetch(API_CONFIG.ORDERS, {
      method: "POST",
      headers: {
        ...AUTH_UTILS.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Orden creada exitosamente
      showNotification("¡Compra realizada con éxito!", "success");

      // Actualizar contador del carrito (ahora vacío)
      updateCartCounter();

      // Redirigir a órdenes
      setTimeout(() => {
        window.location.href = "orders.html";
      }, 2000);
    } else {
      showNotification(result.message || "Error al crear la orden", "error");
      checkoutButton.disabled = false;
      checkoutButton.textContent = originalText;
    }
  } catch (error) {
    console.error("Error en checkout:", error);
    showNotification("Error de conexión con el servidor", "error");
    checkoutButton.disabled = false;
    checkoutButton.textContent = originalText;
  }
}
