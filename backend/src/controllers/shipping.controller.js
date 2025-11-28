const { pool } = require("../config/db");

/**
 * @route   GET /api/shipping-addresses
 * @desc    Obtener todas las direcciones del usuario autenticado
 * @access  Private
 */
async function getUserAddresses(req, res) {
  const userId = req.userId;

  let conn;
  try {
    conn = await pool.getConnection();

    const addresses = await conn.query(
      `SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    // Convertir is_default de tinyint a boolean
    const formatted = addresses.map((addr) => ({
      ...addr,
      is_default: Boolean(addr.is_default),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error en getUserAddresses:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener direcciones",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/shipping-addresses
 * @desc    Crear nueva dirección de envío
 * @access  Private
 */
async function createAddress(req, res) {
  const userId = req.userId;
  const {
    street,
    number,
    corner,
    department,
    city,
    state,
    country,
    postal_code,
    is_default,
  } = req.body;

  // Validaciones
  if (!street || !number || !city || !state) {
    return res.status(400).json({
      error: true,
      message: "Calle, número, ciudad y departamento son requeridos",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Iniciar transacción
    await conn.beginTransaction();

    // Si esta dirección será la predeterminada, primero desmarcar las demás
    if (is_default !== false) {
      await conn.query(
        `UPDATE shipping_addresses SET is_default = FALSE WHERE user_id = ?`,
        [userId]
      );
    }

    // Insertar la nueva dirección
    const result = await conn.query(
      `INSERT INTO shipping_addresses
       (user_id, street, number, corner, department, city, state, country, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        street,
        number,
        corner,
        department,
        city,
        state,
        country || "Uruguay",
        postal_code,
        is_default !== false,
      ]
    );

    // Confirmar transacción
    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Dirección creada exitosamente",
      addressId: Number(result.insertId),
    });
  } catch (err) {
    // Revertir transacción en caso de error
    if (conn) {
      await conn.rollback();
    }
    console.error("Error en createAddress:", err);
    res.status(500).json({
      error: true,
      message: "Error al crear dirección",
      details: err.message,
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   PUT /api/shipping-addresses/:id
 * @desc    Actualizar dirección de envío
 * @access  Private
 */
async function updateAddress(req, res) {
  const userId = req.userId;
  const addressId = req.params.id;
  const {
    street,
    number,
    corner,
    department,
    city,
    state,
    country,
    postal_code,
    is_default,
  } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    // Iniciar transacción
    await conn.beginTransaction();

    // Verificar que la dirección pertenece al usuario
    const [address] = await conn.query(
      "SELECT id FROM shipping_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (!address) {
      await conn.rollback();
      return res.status(404).json({
        error: true,
        message: "Dirección no encontrada",
      });
    }

    // Si se está marcando como predeterminada, desmarcar las demás
    if (is_default === true) {
      await conn.query(
        `UPDATE shipping_addresses SET is_default = FALSE WHERE user_id = ? AND id != ?`,
        [userId, addressId]
      );
    }

    // Construir query dinámicamente
    const updates = [];
    const params = [];

    if (street !== undefined) {
      updates.push("street = ?");
      params.push(street);
    }
    if (number !== undefined) {
      updates.push("number = ?");
      params.push(number);
    }
    if (corner !== undefined) {
      updates.push("corner = ?");
      params.push(corner);
    }
    if (department !== undefined) {
      updates.push("department = ?");
      params.push(department);
    }
    if (city !== undefined) {
      updates.push("city = ?");
      params.push(city);
    }
    if (state !== undefined) {
      updates.push("state = ?");
      params.push(state);
    }
    if (country !== undefined) {
      updates.push("country = ?");
      params.push(country);
    }
    if (postal_code !== undefined) {
      updates.push("postal_code = ?");
      params.push(postal_code);
    }
    if (is_default !== undefined) {
      updates.push("is_default = ?");
      params.push(is_default);
    }

    if (updates.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        error: true,
        message: "No hay campos para actualizar",
      });
    }

    params.push(addressId, userId);

    await conn.query(
      `UPDATE shipping_addresses SET ${updates.join(
        ", "
      )} WHERE id = ? AND user_id = ?`,
      params
    );

    // Confirmar transacción
    await conn.commit();

    res.json({
      success: true,
      message: "Dirección actualizada exitosamente",
    });
  } catch (err) {
    // Revertir transacción en caso de error
    if (conn) {
      await conn.rollback();
    }
    console.error("Error en updateAddress:", err);
    res.status(500).json({
      error: true,
      message: "Error al actualizar dirección",
      details: err.message,
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   DELETE /api/shipping-addresses/:id
 * @desc    Eliminar dirección de envío
 * @access  Private
 */
async function deleteAddress(req, res) {
  const userId = req.userId;
  const addressId = req.params.id;

  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      "DELETE FROM shipping_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: "Dirección no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Dirección eliminada exitosamente",
    });
  } catch (err) {
    console.error("Error en deleteAddress:", err);
    res.status(500).json({
      error: true,
      message: "Error al eliminar dirección",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
