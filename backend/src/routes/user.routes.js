const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload.middleware");

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get("/profile", verifyToken, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put("/profile", verifyToken, userController.updateProfile);

/**
 * @route   PUT /api/users/avatar
 * @desc    Actualizar avatar del usuario (upload a Cloudinary)
 * @access  Private
 */
router.put(
  "/avatar",
  verifyToken,
  upload.single("avatar"),
  userController.uploadAvatar
);

/**
 * @route   POST /api/users/change-password
 * @desc    Cambiar contraseña del usuario
 * @access  Private
 */
router.post("/change-password", verifyToken, userController.changePassword);

/**
 * @route   DELETE /api/users/account
 * @desc    Eliminar cuenta del usuario
 * @access  Private
 */
router.delete("/account", verifyToken, userController.deleteAccount);

/**
 * @route   GET /api/users/:username
 * @desc    Obtener perfil público por username
 * @access  Public
 */
router.get("/:username", userController.getPublicProfile);

module.exports = router;
