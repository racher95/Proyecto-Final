const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const upload = require("../middleware/upload.middleware");

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (acepta avatar opcional)
 * @access  Public
 */
router.post("/register", upload.single("avatar"), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (opcional, JWT es stateless)
 * @access  Private
 */
router.post("/logout", authController.logout);

module.exports = router;
