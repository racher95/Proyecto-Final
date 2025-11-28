const jwt = require("jsonwebtoken");

/**
 * Middleware para verificar el token JWT
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Token no proporcionado",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: true,
        message: "Token inválido o expirado",
      });
    }

    // Agregar información del usuario al request
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  });
}

/**
 * Middleware opcional para verificar token (permite acceso sin token)
 */
function optionalToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.userId = decoded.userId;
      req.username = decoded.username;
    }
    next();
  });
}

module.exports = {
  verifyToken,
  optionalToken,
};
