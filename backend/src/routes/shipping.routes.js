const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shipping.controller");
const { verifyToken } = require("../middleware/auth");

/**
 * @route   GET /api/shipping-addresses
 * @desc    Obtener direcciones del usuario
 * @access  Private
 */
router.get("/", verifyToken, shippingController.getUserAddresses);

/**
 * @route   POST /api/shipping-addresses
 * @desc    Crear nueva dirección
 * @access  Private
 */
router.post("/", verifyToken, shippingController.createAddress);

/**
 * @route   PUT /api/shipping-addresses/:id
 * @desc    Actualizar dirección
 * @access  Private
 */
router.put("/:id", verifyToken, shippingController.updateAddress);

/**
 * @route   DELETE /api/shipping-addresses/:id
 * @desc    Eliminar dirección
 * @access  Private
 */
router.delete("/:id", verifyToken, shippingController.deleteAddress);

module.exports = router;
