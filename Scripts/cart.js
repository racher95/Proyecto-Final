/**
 * Gestión del carrito de compras de Craftivity
 * Maneja visualización, modificación y cálculos del carrito
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 *
 * Nota: Utiliza showNotification() y updateCartCounter() de main.js
 * para mantener consistencia y evitar duplicación de código.
 */

// Cuando carga la página del carrito, lo inicializo
document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  setupCheckoutListeners();
  loadSavedAddress();
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

// Cargar dirección guardada si existe
// Si el usuario tiene una dirección guardada de compras anteriores, la autocompleta
function loadSavedAddress() {
  const session = checkSession();
  if (!session || !session.isLoggedIn) return;

  const userProfile = getUserProfile(session.usuario);
  if (userProfile && userProfile.shippingAddress) {
    const addr = userProfile.shippingAddress;
    document.getElementById("department").value = addr.department || "";
    document.getElementById("city").value = addr.city || "";
    document.getElementById("street").value = addr.street || "";
    document.getElementById("number").value = addr.number || "";
    document.getElementById("corner").value = addr.corner || "";
  }
}

/**
 * Carga y muestra el contenido del carrito desde localStorage
 */
function loadCart() {
  // Obtengo el carrito usando función utilitaria
  const cart = getCart();
  const emptyCart = document.getElementById("emptyCart");
  const cartContent = document.getElementById("cartContent");
  // Si hay productos, muestro mensaje de carrito vacio
  if (cart.length === 0) {
    if (emptyCart) emptyCart.classList.add("show");
    if (cartContent) cartContent.classList.remove("show");
  } else {
    // Si hay productos, muestro el contenido del carrito
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
    .map(
      (item) => `
        <div class="cart-item" data-item-id="${item.id}">
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
                <button class="quantity-btn decrease" data-item-id="${
                  item.id
                }" data-quantity="${item.quantity - 1}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-item-id="${
                  item.id
                }" data-quantity="${item.quantity + 1}">+</button>
            </div>
            <div class="cart-item-total">
                ${formatCurrency(
                  (item.cost || 0) * item.quantity,
                  item.currency || "UYU"
                )}
            </div>
            <button class="remove-btn" data-item-id="${
              item.id
            }" title="Eliminar producto">🗑️</button>
        </div>
    `
    )
    .join("");

  // Inserto el HTML en el contenedor
  cartItems.innerHTML = itemsHTML;
}

/**
 * Actualiza la cantidad de un producto
 * Si la cantidad es menor a 1, elimina el producto del carrito
 */
function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    // Si la cantidad es 0 o negativa, elimino el producto
    removeFromCart(productId);
    return;
  }

  // Obtengo el carrito actual
  let cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex !== -1) {
    // Actualizo la cantidad del producto
    cart[itemIndex].quantity = newQuantity;
    saveCart(cart);

    // Recargo la vista del carrito
    loadCart();
    updateCartCounter(); // Actualizo el contador en el header
  }
}

// Elimina un producto del carrito
function removeFromCart(productId) {
  // Filtro el carrito para excluir el producto seleccionado
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);

  // Guardo el carrito actualizado
  saveCart(cart);

  // Recargo la vista y muestro confirmación
  loadCart();
  updateCartCounter();
  showNotification("Producto eliminado del carrito", "success");
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
function checkout() {
  // Validar que el usuario esté logueado
  const session = checkSession();
  if (!session || !session.isLoggedIn) {
    showNotification("Debes iniciar sesión para finalizar la compra", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // Valida que haya productos en el carrito
  const cart = getCart();
  if (cart.length === 0) {
    showNotification("Tu carrito está vacío", "error");
    return;
  }

  // Validar cantidades mayores a 0
  const invalidQuantity = cart.some((item) => item.quantity <= 0);
  if (invalidQuantity) {
    showNotification(
      "Todos los productos deben tener cantidad mayor a 0",
      "error"
    );
    return;
  }

  // Validar tipo de envío seleccionado
  const shippingType = document.querySelector(
    'input[name="shippingType"]:checked'
  );
  if (!shippingType) {
    showNotification("Debes seleccionar un tipo de envío", "error");
    return;
  }

  // Validar dirección completa
  const department = document.getElementById("department").value.trim();
  const city = document.getElementById("city").value.trim();
  const street = document.getElementById("street").value.trim();
  const number = document.getElementById("number").value.trim();
  const corner = document.getElementById("corner").value.trim();

  if (!department || !city || !street || !number || !corner) {
    showNotification("Debes completar todos los campos de dirección", "error");
    return;
  }

  // Validar forma de pago seleccionada
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );
  if (!paymentMethod) {
    showNotification("Debes seleccionar una forma de pago", "error");
    return;
  }

  // Si elige pago con tarjeta, valida todos los campos (número, titular, vencimiento, CVV)
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

    // Verifica que el número de tarjeta tenga entre 13 y 16 dígitos
    if (
      cardNumber.length < 13 ||
      cardNumber.length > 16 ||
      !/^\d+$/.test(cardNumber)
    ) {
      showNotification("Número de tarjeta inválido", "error");
      return;
    }

    // Validar formato de vencimiento MM/AA
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      showNotification("Formato de vencimiento inválido (usar MM/AA)", "error");
      return;
    }

    // Validar CVV
    if (cardCVV.length < 3 || cardCVV.length > 4 || !/^\d+$/.test(cardCVV)) {
      showNotification("CVV inválido", "error");
      return;
    }
  }

  // Si pasó todas las validaciones, crear el pedido
  const address = { department, city, street, number, corner };
  const paymentDetails =
    paymentMethod.value === "credit"
      ? {
          cardNumber: document.getElementById("cardNumber").value.trim(),
          cardHolder: document.getElementById("cardHolder").value.trim(),
          cardExpiry: document.getElementById("cardExpiry").value.trim(),
        }
      : null;

  const order = createOrder(
    cart,
    shippingType.value,
    address,
    paymentMethod.value,
    paymentDetails
  );

  // Guardar pedido
  saveOrder(order);

  // Si marcó "guardar dirección", la guarda en su perfil para próximas compras
  if (document.getElementById("saveAddress").checked) {
    upsertUserProfile(session.usuario, {
      shippingAddress: address,
    });
  }

  // Vaciar carrito
  saveCart([]);
  updateCartCounter();

  // Mostrar notificación de éxito
  showNotification("Compra realizada con éxito", "success");

  // Redirigir a historial de pedidos
  setTimeout(() => {
    window.location.href = "orders.html";
  }, 2000);
}
