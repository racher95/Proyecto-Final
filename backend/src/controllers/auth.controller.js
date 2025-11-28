const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { uploadImage } = require("../../config/cloudinary.config");

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
async function register(req, res) {
  const { username, email, password, firstName, lastName } = req.body;

  // Validación básica
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: true,
      message: "Todos los campos son requeridos",
    });
  }

  // Validar username
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      error: true,
      message: "El nombre de usuario debe tener entre 3 y 20 caracteres",
    });
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    return res.status(400).json({
      error: true,
      message: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Limpiar username: sin espacios, lowercase
    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, "");

    // Verificar si el usuario ya existe (por username o email)
    const [existingUser] = await conn.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [cleanUsername, email]
    );

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "El nombre de usuario o email ya está registrado",
      });
    }

    // Hash de la contraseña (10 rounds de salt)
    const passwordHash = await bcrypt.hash(password, 10);

    // Manejar avatar si viene en el request (archivo o base64)
    let avatarUrl = null;
    if (req.file) {
      // Si viene archivo (multipart/form-data)
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
      const uploadResult = await uploadImage(
        base64Image,
        "avatars",
        `temp_${Date.now()}`
      );
      avatarUrl = uploadResult.url;
    }

    // Insertar usuario
    const result = await conn.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanUsername, email, passwordHash, firstName, lastName, avatarUrl]
    );

    const userId = Number(result.insertId);

    // Crear carrito para el usuario
    await conn.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);

    // Generar token JWT
    const token = jwt.sign(
      { userId, username: cleanUsername },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        userId: userId,
        username: cleanUsername,
        email,
        firstName,
        lastName,
        avatar: avatarUrl,
        token,
      },
    });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({
      error: true,
      message: "Error al registrar usuario",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
async function login(req, res) {
  const { username, password } = req.body;

  // Validación básica
  if (!username || !password) {
    return res.status(400).json({
      error: true,
      message: "Username y password son requeridos",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Buscar usuario por username O email
    const [user] = await conn.query(
      "SELECT id, username, email, password_hash, first_name, last_name, avatar_url, theme FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: true,
        message: "Credenciales inválidas",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar_url,
        theme: user.theme,
        token,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({
      error: true,
      message: "Error al iniciar sesión",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (JWT es stateless, solo informativo)
 * @access  Private
 */
async function logout(req, res) {
  // Con JWT, el logout es del lado del cliente (eliminar token)
  res.json({
    success: true,
    message: "Logout exitoso. Elimina el token del cliente.",
  });
}

module.exports = {
  register,
  login,
  logout,
};
