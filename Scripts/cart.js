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

  // Configurar el botón de checkout
  const checkoutButton = document.getElementById("checkoutButton");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", checkout);
  }

  // Configurar event delegation para elementos dinámicos del carrito
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
});

/**
 * Carga y muestra el contenido del carrito
 * Lee los datos del localStorage y actualiza la interfaz
 */
function loadCart() {
  // Obtengo el carrito usando función utilitaria
  const cart = getCart();
  console.log("🛒 Carrito cargado:", cart);

  const emptyCart = document.getElementById("emptyCart");
  const cartContent = document.getElementById("cartContent");
  const cartItems = document.getElementById("cartItems");

  if (cart.length === 0) {
    // Si no hay productos, muestro el mensaje de carrito vacío
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

/**
 * Genera el HTML para mostrar los productos del carrito
 * @param {Array} cart - array con los productos del carrito
 */
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
 * Actualiza la cantidad de un producto en el carrito
 * @param {number} productId - ID del producto a modificar
 * @param {number} newQuantity - nueva cantidad (si es 0 o menos, se elimina)
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

/**
 * Elimina un producto completamente del carrito
 * @param {number} productId - ID del producto a eliminar
 */
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
 * Calcula y muestra el resumen de precios del carrito
 * Incluye subtotal, IVA, envío y total final
 * @param {Array} cart - productos del carrito
 */
function updateCartSummary(cart) {
  console.log("📊 Calculando resumen del carrito:", cart);

  // Calculo el subtotal sumando precio × cantidad de cada producto
  const subtotal = cart.reduce((sum, item) => {
    const itemCost = item.cost || 0;
    const itemQuantity = item.quantity || 0;
    const itemTotal = itemCost * itemQuantity;
    console.log(
      `   Producto: ${item.name}, Costo: ${itemCost}, Cantidad: ${itemQuantity}, Total: ${itemTotal}`
    );
    return sum + itemTotal;
  }, 0);

  // Configurar costos adicionales
  const shippingCost = 350; // Costo de envío fijo
  const ivaRate = 0.22; // IVA del 22%
  const iva = subtotal * ivaRate;
  const total = subtotal + iva + shippingCost;

  console.log(
    `💰 Subtotal: ${subtotal}, IVA: ${iva}, Envío: ${shippingCost}, Total: ${total}`
  );

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
 * Inicia el proceso de checkout (simulado)
 * En una app real, esto redirigiría a la página de pago
 */
function checkout() {
  const cart = getCart();

  if (cart.length === 0) {
    showNotification("Tu carrito está vacío", "error");
    return;
  }

  // Simulo el proceso de pago
  showNotification("Redirigiendo al proceso de pago...", "success");

  // En una implementación real, aquí redirigiría a la página de checkout
  setTimeout(() => {
    alert("Funcionalidad de pago en desarrollo. ¡Gracias por tu interés!");
  }, 1500);
}
