/**
 * Gestión de historial de pedidos
 * Muestra los pedidos del usuario desde el backend
 */

document.addEventListener("DOMContentLoaded", function () {
  loadOrders();
});

// Cargar y mostrar pedidos del usuario desde el backend
async function loadOrders() {
  if (!AUTH_UTILS.isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  const container = document.getElementById("ordersContainer");
  const emptyMessage = document.getElementById("emptyOrders");

  // Mostrar loading
  container.innerHTML = '<div class="loading">Cargando pedidos...</div>';
  container.style.display = "block";
  emptyMessage.style.display = "none";

  try {
    const response = await fetch(API_CONFIG.ORDERS, {
      method: "GET",
      headers: AUTH_UTILS.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Error al cargar pedidos");
    }

    const result = await response.json();
    const orders = result.data || [];

    if (orders.length === 0) {
      emptyMessage.style.display = "block";
      container.style.display = "none";
      return;
    }

    emptyMessage.style.display = "none";
    container.style.display = "block";

    container.innerHTML = orders
      .map((order) => createOrderCard(order))
      .join("");

    // Agregar listeners para expandir detalles
    setupOrderListeners();
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    container.innerHTML =
      '<div class="error-message">Error al cargar los pedidos. Intenta nuevamente.</div>';
    showNotification("Error al cargar pedidos", "error");
  }
}

// Crear HTML de una tarjeta de pedido
function createOrderCard(order) {
  const date = new Date(order.created_at || order.date);
  const formattedDate = date.toLocaleDateString("es-UY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusClass = getStatusClass(order.status);
  const statusText = getStatusText(order.status);

  // Adaptar estructura del backend (order.items es array de productos)
  const items = order.items || [];

  return `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-info">
          <h3>Pedido #${order.id}</h3>
          <p class="order-date">${formattedDate}</p>
        </div>
        <div class="order-status ${statusClass}">
          ${statusText}
        </div>
      </div>

      <div class="order-summary">
        <div class="order-items-preview">
          <p><strong>${items.length}</strong> producto${
    items.length !== 1 ? "s" : ""
  }</p>
          <p>Envío: <strong>${order.shipping_type || "Estándar"}</strong></p>
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
            ${items
              .map((item) => {
                // Obtener la primera imagen del array o mostrar ícono
                const hasImage = item.images && item.images.length > 0;
                const imageUrl = hasImage ? item.images[0] : null;

                return `
              <div class="order-item">
                ${
                  hasImage
                    ? `<img src="${imageUrl}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="no-image" style="display:none;"><i class="fas fa-box"></i></div>`
                    : `<div class="no-image"><i class="fas fa-box"></i></div>`
                }
                <div class="item-info">
                  <p class="item-name">${item.name}</p>
                  <p class="item-quantity">Cantidad: ${item.quantity}</p>
                  <p class="item-price-unit">${formatCurrency(
                    item.price,
                    "UYU"
                  )} c/u</p>
                </div>
                <p class="item-price">${formatCurrency(
                  item.price * item.quantity,
                  "UYU"
                )}</p>
              </div>
            `;
              })
              .join("")}
          </div>
        </div>

        <div class="details-section">
          <h4>Dirección de Envío</h4>
          <p>${
            order.shipping_address?.street || order.shipping?.street || "N/A"
          } ${
    order.shipping_address?.number || order.shipping?.number || ""
  }</p>
          <p>Esquina: ${
            order.shipping_address?.corner || order.shipping?.corner || "N/A"
          }</p>
          <p>${
            order.shipping_address?.locality || order.shipping?.city || "N/A"
          }, ${
    order.shipping_address?.department || order.shipping?.department || "N/A"
  }</p>
        </div>

        <div class="details-section">
          <h4>Forma de Pago</h4>
          <p>${
            order.payment_method === "credit_card" ||
            order.payment?.method === "credit"
              ? "Tarjeta de Crédito"
              : "Transferencia Bancaria"
          }</p>
        </div>

        <div class="details-section">
          <h4>Desglose de Costos</h4>
          <div class="cost-breakdown">
            <div class="cost-line">
              <span>Subtotal:</span>
              <span>${formatCurrency(
                order.subtotal || order.total,
                "UYU"
              )}</span>
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
