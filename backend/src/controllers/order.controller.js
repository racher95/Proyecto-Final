const { pool } = require("../config/db");

/**
 * @route   GET /api/orders
 * @desc    Obtener todas las órdenes del usuario autenticado
 * @access  Private
 */
async function getUserOrders(req, res) {
  const userId = req.userId;

  let conn;
  try {
    conn = await pool.getConnection();

    const orders = await conn.query(
      `
      SELECT
        id,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        subtotal,
        shipping_cost,
        total,
        status,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [userId]
    );

    // Para cada orden, obtener sus items con información del producto
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await conn.query(
          `
        SELECT
          oi.product_id as productId,
          oi.product_name as name,
          oi.product_price as price,
          oi.quantity,
          oi.subtotal,
          GROUP_CONCAT(pi.image_url ORDER BY pi.display_order SEPARATOR '|||') as imageUrls
        FROM order_items oi
        LEFT JOIN product_images pi ON oi.product_id = pi.product_id
        WHERE oi.order_id = ?
        GROUP BY oi.id
      `,
          [order.id]
        );

        return {
          id: order.id,
          shipping_address: order.shipping_address
            ? JSON.parse(order.shipping_address)
            : null,
          subtotal: Number(order.subtotal),
          shipping_cost: Number(order.shipping_cost),
          total: Number(order.total),
          status: order.status,
          created_at: order.created_at,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
            images: item.imageUrls ? item.imageUrls.split("|||") : [],
          })),
        };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
    });
  } catch (err) {
    console.error("Error en getUserOrders:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener órdenes",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener detalle de una orden
 * @access  Private
 */
async function getOrderById(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener orden verificando que pertenece al usuario
    const [order] = await conn.query(
      `
      SELECT *
      FROM orders
      WHERE id = ? AND user_id = ?
    `,
      [id, userId]
    );

    if (!order) {
      return res.status(404).json({
        error: true,
        message: "Orden no encontrada",
      });
    }

    // Obtener items de la orden con información de imágenes
    const items = await conn.query(
      `
      SELECT
        oi.product_id as productId,
        oi.product_name as name,
        oi.product_price as price,
        oi.quantity,
        oi.subtotal,
        GROUP_CONCAT(pi.image_url ORDER BY pi.display_order SEPARATOR '|||') as imageUrls
      FROM order_items oi
      LEFT JOIN product_images pi ON oi.product_id = pi.product_id
      WHERE oi.order_id = ?
      GROUP BY oi.id
    `,
      [id]
    );

    res.json({
      id: order.id,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      shippingPostalCode: order.shipping_postal_code,
      shippingCountry: order.shipping_country,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shipping_cost),
      total: Number(order.total),
      status: order.status,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        images: item.imageUrls ? item.imageUrls.split("|||") : [],
      })),
      createdAt: order.created_at,
    });
  } catch (err) {
    console.error("Error en getOrderById:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener orden",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/orders
 * @desc    Crear nueva orden desde el carrito
 * @access  Private
 */
async function createOrder(req, res) {
  const userId = req.userId;
  const { shippingAddress, paymentMethod = "credit_card" } = req.body;

  // Validación de dirección (estructura uruguaya)
  if (
    !shippingAddress ||
    !shippingAddress.department ||
    !shippingAddress.locality ||
    !shippingAddress.street ||
    !shippingAddress.number
  ) {
    return res.status(400).json({
      error: true,
      message:
        "Todos los datos de envío son requeridos (department, locality, street, number)",
    });
  }

  // Convertir a string JSON para la BD
  const addressString = JSON.stringify(shippingAddress);

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Obtener carrito
    const [cart] = await conn.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);

    if (!cart) {
      await conn.rollback();
      return res.status(400).json({
        error: true,
        message: "No tienes un carrito",
      });
    }

    // Obtener items del carrito
    const items = await conn.query(
      `
      SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        CASE
          WHEN p.flash_sale_active = 1 THEN p.flash_sale_price
          ELSE p.cost
        END as price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `,
      [cart.id]
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        error: true,
        message: "El carrito está vacío",
      });
    }

    // Calcular subtotal (shipping_cost siempre 0 en Uruguay)
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const shippingCost = 0;
    const total = subtotal + shippingCost;

    // Crear orden
    const orderResult = await conn.query(
      `INSERT INTO orders (
        user_id, shipping_address, shipping_city, shipping_state,
        shipping_postal_code, shipping_country, subtotal, shipping_cost, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        addressString,
        shippingAddress.locality,
        shippingAddress.department,
        "11000",
        "Uruguay",
        subtotal,
        shippingCost,
        total,
      ]
    );

    const orderId = Number(orderResult.insertId);

    // Crear items de la orden
    for (const item of items) {
      const itemSubtotal = Number(item.price) * item.quantity;
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.price,
          item.quantity,
          itemSubtotal,
        ]
      );
    }

    // Vaciar carrito
    await conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cart.id]);

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      data: {
        orderId,
        total,
      },
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Error en createOrder:", err);
    res.status(500).json({
      error: true,
      message: "Error al crear orden",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
};
