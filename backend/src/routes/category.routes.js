const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get("/", categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener categoría por ID
 * @access  Public
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @route   GET /api/categories/:id/products
 * @desc    Obtener productos de una categoría
 * @access  Public
 */
router.get("/:id/products", categoryController.getCategoryProducts);

module.exports = router;
