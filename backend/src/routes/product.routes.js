const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middleware/auth");

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros opcionales
 * @query   category, search, featured, flash_sale
 * @access  Public
 */
router.get("/", productController.getAllProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Obtener productos destacados
 * @access  Public
 */
router.get("/featured", productController.getFeaturedProducts);

/**
 * @route   GET /api/products/flash-sales
 * @desc    Obtener productos en oferta flash activos
 * @access  Public
 */
router.get("/flash-sales", productController.getFlashSales);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener producto por ID
 * @access  Public
 */
router.get("/:id", productController.getProductById);

/**
 * @route   GET /api/products/:id/comments
 * @desc    Obtener comentarios de un producto
 * @access  Public
 */
router.get("/:id/comments", productController.getProductComments);

/**
 * @route   POST /api/products/:id/comments
 * @desc    Agregar comentario a un producto
 * @access  Private
 */
router.post("/:id/comments", verifyToken, productController.addComment);

module.exports = router;
