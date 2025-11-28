const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middleware/auth");

/**
 * @route   GET /api/orders
 * @desc    Obtener todas las órdenes del usuario autenticado
 * @access  Private
 */
router.get("/", verifyToken, orderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener detalle de una orden
 * @access  Private
 */
router.get("/:id", verifyToken, orderController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Crear nueva orden desde el carrito
 * @access  Private
 */
router.post("/", verifyToken, orderController.createOrder);

module.exports = router;
