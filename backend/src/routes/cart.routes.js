const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { verifyToken } = require("../middleware/auth");

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito del usuario autenticado
 * @access  Private
 */
router.get("/", verifyToken, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Agregar item al carrito
 * @access  Private
 */
router.post("/items", verifyToken, cartController.addItem);

/**
 * @route   PUT /api/cart/items/:id
 * @desc    Actualizar cantidad de un item
 * @access  Private
 */
router.put("/items/:id", verifyToken, cartController.updateItem);

/**
 * @route   DELETE /api/cart/items/:id
 * @desc    Eliminar item del carrito
 * @access  Private
 */
router.delete("/items/:id", verifyToken, cartController.deleteItem);

/**
 * @route   DELETE /api/cart
 * @desc    Vaciar carrito
 * @access  Private
 */
router.delete("/", verifyToken, cartController.clearCart);

module.exports = router;
