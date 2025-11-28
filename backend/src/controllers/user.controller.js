const { pool } = require("../config/db");
const { uploadImage, deleteImage } = require("../../config/cloudinary.config");
const bcrypt = require("bcryptjs");

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
async function getProfile(req, res) {
  const userId = req.userId;

  let conn;
  try {
    conn = await pool.getConnection();

    const [user] = await conn.query(
      `SELECT id, username, email, first_name, last_name, avatar_url, theme, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar_url,
      theme: user.theme,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error("Error en getProfile:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener perfil",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
async function updateProfile(req, res) {
  const userId = req.userId;
  const {
    firstName,
    first_name,
    lastName,
    last_name,
    displayName,
    display_name,
    email,
    avatar,
    theme,
  } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    const updates = [];
    const params = [];

    // Priorizar display_name sobre first_name/last_name
    const dName = displayName || display_name;

    if (dName !== undefined) {
      // Si viene display_name, actualizar solo ese campo
      updates.push("first_name = ?");
      params.push(dName);
      // Limpiar last_name si existe
      updates.push("last_name = ?");
      params.push("");
    } else {
      // Fallback a first_name/last_name (para compatibilidad)
      const fName = firstName || first_name;
      const lName = lastName || last_name;

      if (fName !== undefined) {
        updates.push("first_name = ?");
        params.push(fName);
      }
      if (lName !== undefined) {
        updates.push("last_name = ?");
        params.push(lName);
      }
    }

    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email);
    }
    if (avatar !== undefined) {
      updates.push("avatar_url = ?");
      params.push(avatar);
    }
    if (theme && ["light", "dark"].includes(theme)) {
      updates.push("theme = ?");
      params.push(theme);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: true,
        message: "No hay campos para actualizar",
      });
    }

    params.push(userId);

    await conn.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
    });
  } catch (err) {
    console.error("Error en updateProfile:", err);
    res.status(500).json({
      error: true,
      message: "Error al actualizar perfil",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/users/:username
 * @desc    Obtener perfil público por username
 * @access  Public
 */
async function getPublicProfile(req, res) {
  const { username } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    const [user] = await conn.query(
      `SELECT username, first_name, last_name, avatar_url, theme, created_at
       FROM users WHERE username = ?`,
      [username]
    );

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar_url,
      theme: user.theme,
      memberSince: user.created_at,
    });
  } catch (err) {
    console.error("Error en getPublicProfile:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener perfil",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   PUT /api/users/avatar
 * @desc    Actualizar avatar del usuario (upload a Cloudinary)
 * @access  Private
 */
async function uploadAvatar(req, res) {
  const userId = req.userId;

  // Validar que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({
      error: true,
      message: "No se recibió ningún archivo",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener avatar anterior para eliminarlo de Cloudinary
    const [user] = await conn.query(
      "SELECT avatar_url FROM users WHERE id = ?",
      [userId]
    );

    // Convertir buffer a base64 para Cloudinary
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Subir nueva imagen a Cloudinary
    const uploadResult = await uploadImage(
      base64Image,
      "avatars",
      `user_${userId}` // Public ID único por usuario - esto sobrescribe automáticamente
    );

    // Actualizar URL en la base de datos
    await conn.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
      uploadResult.url,
      userId,
    ]);

    // Si el avatar anterior tenía un publicId diferente (ej: temp_*), eliminarlo
    if (user && user.avatar_url && user.avatar_url.includes("cloudinary")) {
      try {
        // Extraer publicId de URL Cloudinary
        // URL ejemplo: https://res.cloudinary.com/dcdfqlivp/image/upload/v1764081116/avatars/temp_1764081115143.jpg
        const urlParts = user.avatar_url.split("/");
        const uploadIndex = urlParts.indexOf("upload");
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          // Saltar versión (v1234...) y obtener folder/filename
          const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
          const oldPublicId = publicIdWithExt.split(".")[0]; // Remover extensión
          const newPublicId = `avatars/user_${userId}`;

          // Solo eliminar si es diferente al nuevo (evitar eliminar el que acabamos de subir)
          if (oldPublicId !== newPublicId) {
            await deleteImage(oldPublicId);
          }
        }
      } catch (err) {
        // Ignorar errores de eliminación de avatar anterior
      }
    }

    res.json({
      success: true,
      message: "Avatar actualizado exitosamente",
      avatarUrl: uploadResult.url,
    });
  } catch (err) {
    console.error("Error en uploadAvatar:", err);
    res.status(500).json({
      error: true,
      message: "Error al subir avatar",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/users/change-password
 * @desc    Cambiar contraseña del usuario
 * @access  Private
 */
async function changePassword(req, res) {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  // Validaciones
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: true,
      message: "Contraseña actual y nueva son requeridas",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: true,
      message: "La nueva contraseña debe tener al menos 6 caracteres",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener hash actual
    const [users] = await conn.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );
    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Contraseña actual incorrecta",
      });
    }

    // Hash de la nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await conn.query(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newHash, userId]
    );

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (err) {
    console.error("Error en changePassword:", err);
    res.status(500).json({
      error: true,
      message: "Error al cambiar contraseña",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   DELETE /api/users/account
 * @desc    Eliminar cuenta del usuario
 * @access  Private
 */
async function deleteAccount(req, res) {
  const userId = req.userId;
  const { password } = req.body;

  // Validar que se envió la contraseña
  if (!password) {
    return res.status(400).json({
      error: true,
      message: "Contraseña requerida para confirmar eliminación",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener datos del usuario
    const [users] = await conn.query(
      "SELECT password_hash, avatar_url FROM users WHERE id = ?",
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Contraseña incorrecta",
      });
    }

    // Eliminar avatar de Cloudinary si existe
    if (users[0].avatar_url && users[0].avatar_url.includes("cloudinary")) {
      try {
        const publicId = `craftivity/avatars/user_${userId}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("Error al eliminar avatar de Cloudinary:", cloudErr);
        // No fallar la eliminación de cuenta si falla la eliminación del avatar
      }
    }

    // Eliminar usuario (CASCADE eliminará carrito, direcciones, comentarios, etc.)
    await conn.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({
      success: true,
      message: "Cuenta eliminada exitosamente",
    });
  } catch (err) {
    console.error("Error en deleteAccount:", err);
    res.status(500).json({
      error: true,
      message: "Error al eliminar cuenta",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
};
