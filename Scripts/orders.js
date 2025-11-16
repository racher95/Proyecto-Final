/**
 * Gestión de historial de pedidos
 * Muestra los pedidos del usuario logueado desde localStorage
 * Autor: Grupo 7 - Proyecto Final JAP 2025
 */

document.addEventListener("DOMContentLoaded", function () {
  loadOrders();
});

// Cargar y mostrar pedidos del usuario
function loadOrders() {
  const session = checkSession();

  if (!session || !session.isLoggedIn) {
    window.location.href = "login.html";
    return;
  }

  const orders = getOrders(session.usuario);
  const container = document.getElementById("ordersContainer");
  const emptyMessage = document.getElementById("emptyOrders");

  if (orders.length === 0) {
    emptyMessage.style.display = "block";
    container.style.display = "none";
    return;
  }

  emptyMessage.style.display = "none";
  container.style.display = "block";

  container.innerHTML = orders.map((order) => createOrderCard(order)).join("");

  // Agregar listeners para expandir detalles
  setupOrderListeners();
}

// Crear HTML de una tarjeta de pedido
function createOrderCard(order) {
  const date = new Date(order.date);
  const formattedDate = date.toLocaleDateString("es-UY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusClass = getStatusClass(order.status);
  const statusText = getStatusText(order.status);

  return `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-info">
          <h3>Pedido ${order.id}</h3>
          <p class="order-date">${formattedDate}</p>
        </div>
        <div class="order-status ${statusClass}">
          ${statusText}
        </div>
      </div>

      <div class="order-summary">
        <div class="order-items-preview">
          <p><strong>${order.items.length}</strong> producto${
    order.items.length > 1 ? "s" : ""
  }</p>
          <p>Envío: <strong>${order.shipping.type_name}</strong></p>
        </div>
        <div class="order-total">
          <p class="total-label">Total</p>
          <p class="total-amount">${formatCurrency(order.total, "UYU")}</p>
        </div>
      </div>

      <button class="toggle-details-btn" data-order-id="${order.id}">
        Ver Detalles
      </button>

      <div class="order-details" id="details-${
        order.id
      }" style="display: none;">
        <div class="details-section">
          <h4>Productos</h4>
          <div class="order-items">
            ${order.items
              .map(
                (item) => `
              <div class="order-item">
                <img src="${item.image}" alt="${
                  item.name
                }" onerror="this.src='../img/placeholder.jpg'">
                <div class="item-info">
                  <p class="item-name">${item.name}</p>
                  <p class="item-quantity">Cantidad: ${item.quantity}</p>
                </div>
                <p class="item-price">${formatCurrency(
                  item.subtotal,
                  "UYU"
                )}</p>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="details-section">
          <h4>Dirección de Envío</h4>
          <p>${order.shipping.street} ${order.shipping.number}</p>
          <p>Esquina: ${order.shipping.corner}</p>
          <p>${order.shipping.city}, ${order.shipping.department}</p>
        </div>

        <div class="details-section">
          <h4>Forma de Pago</h4>
          <p>${
            order.payment.method === "credit"
              ? "Tarjeta de Crédito"
              : "Transferencia Bancaria"
          }</p>
          ${
            order.payment.card_last4
              ? `<p>Terminada en: **** ${order.payment.card_last4}</p>`
              : ""
          }
        </div>

        <div class="details-section">
          <h4>Desglose de Costos</h4>
          <div class="cost-breakdown">
            <div class="cost-line">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.subtotal, "UYU")}</span>
            </div>
            <div class="cost-line">
              <span>IVA (22%):</span>
              <span>${formatCurrency(order.tax, "UYU")}</span>
            </div>
            <div class="cost-line">
              <span>Envío:</span>
              <span>${formatCurrency(order.shipping_cost, "UYU")}</span>
            </div>
            <div class="cost-line total">
              <span><strong>Total:</strong></span>
              <span><strong>${formatCurrency(
                order.total,
                "UYU"
              )}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Configurar listeners para expandir/contraer detalles
function setupOrderListeners() {
  const toggleButtons = document.querySelectorAll(".toggle-details-btn");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const orderId = this.getAttribute("data-order-id");
      const details = document.getElementById(`details-${orderId}`);

      if (details.style.display === "none") {
        details.style.display = "block";
        this.textContent = "Ocultar Detalles";
      } else {
        details.style.display = "none";
        this.textContent = "Ver Detalles";
      }
    });
  });
}

// Obtener clase CSS según estado del pedido
function getStatusClass(status) {
  const classes = {
    pending: "status-pending",
    processing: "status-processing",
    shipped: "status-shipped",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return classes[status] || "status-pending";
}

// Obtener texto según estado del pedido
function getStatusText(status) {
  const texts = {
    pending: "Pendiente",
    processing: "En Proceso",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return texts[status] || "Pendiente";
}
