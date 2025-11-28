const { pool } = require("../config/db");

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito del usuario autenticado
 * @access  Private
 */
async function getCart(req, res) {
  const userId = req.userId;

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener o crear carrito
    let [cart] = await conn.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);

    if (!cart) {
      const result = await conn.query(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
      );
      cart = { id: Number(result.insertId) };
    }

    // Obtener items del carrito
    const items = await conn.query(
      `
      SELECT
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.cost,
        p.currency,
        p.flash_sale_active,
        p.flash_sale_price,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `,
      [cart.id]
    );

    const formattedItems = items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      price: item.flash_sale_active
        ? Number(item.flash_sale_price)
        : Number(item.cost),
      currency: item.currency,
      quantity: item.quantity,
      image: item.image,
      subtotal:
        (item.flash_sale_active
          ? Number(item.flash_sale_price)
          : Number(item.cost)) * item.quantity,
    }));

    const total = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      cartId: cart.id,
      items: formattedItems,
      total,
      itemCount: formattedItems.length,
    });
  } catch (err) {
    console.error("Error en getCart:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener carrito",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/cart/items
 * @desc    Agregar item al carrito
 * @access  Private
 */
async function addItem(req, res) {
  const userId = req.userId;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      error: true,
      message: "productId es requerido",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener o crear carrito
    let [cart] = await conn.query("SELECT id FROM carts WHERE user_id = ?", [
      userId,
    ]);

    if (!cart) {
      const result = await conn.query(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
      );
      cart = { id: Number(result.insertId) };
    }

    // Verificar si el producto ya existe en el carrito
    const [existingItem] = await conn.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cart.id, productId]
    );

    if (existingItem) {
      // Actualizar cantidad
      await conn.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [quantity, existingItem.id]
      );
    } else {
      // Insertar nuevo item
      await conn.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cart.id, productId, quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: "Producto agregado al carrito",
    });
  } catch (err) {
    console.error("Error en addItem:", err);
    res.status(500).json({
      error: true,
      message: "Error al agregar producto al carrito",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Actualizar cantidad de un item
 * @access  Private
 */
async function updateItem(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      error: true,
      message: "Cantidad debe ser mayor a 0",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Verificar que el item pertenece al usuario
    const [item] = await conn.query(
      `
      SELECT ci.id
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `,
      [id, userId]
    );

    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item no encontrado en tu carrito",
      });
    }

    // Actualizar cantidad
    await conn.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      quantity,
      id,
    ]);

    res.json({
      success: true,
      message: "Cantidad actualizada",
    });
  } catch (err) {
    console.error("Error en updateItem:", err);
    res.status(500).json({
      error: true,
      message: "Error al actualizar item",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Eliminar item del carrito
 * @access  Private
 */
async function deleteItem(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    // Eliminar item verificando que pertenece al usuario
    const result = await conn.query(
      `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: "Item no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Item eliminado del carrito",
    });
  } catch (err) {
    console.error("Error en deleteItem:", err);
    res.status(500).json({
      error: true,
      message: "Error al eliminar item",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   DELETE /api/cart
 * @desc    Vaciar carrito
 * @access  Private
 */
async function clearCart(req, res) {
  const userId = req.userId;

  let conn;
  try {
    conn = await pool.getConnection();

    // Eliminar todos los items del carrito del usuario
    await conn.query(
      `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ?
    `,
      [userId]
    );

    res.json({
      success: true,
      message: "Carrito vaciado",
    });
  } catch (err) {
    console.error("Error en clearCart:", err);
    res.status(500).json({
      error: true,
      message: "Error al vaciar carrito",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  deleteItem,
  clearCart,
};
