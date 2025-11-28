const { pool } = require("../config/db");

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 */
async function getAllCategories(req, res) {
  let conn;
  try {
    conn = await pool.getConnection();

    const categories = await conn.query(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.image_url as imgSrc,
        COUNT(pc.product_id) as productCount
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      GROUP BY c.id, c.name, c.description, c.image_url
      ORDER BY c.id
    `);

    const formattedCategories = categories.map((cat) => ({
      ...cat,
      productCount: Number(cat.productCount),
    }));

    res.json(formattedCategories);
  } catch (err) {
    console.error("Error en getAllCategories:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener categorías",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener categoría por ID
 * @access  Public
 */
async function getCategoryById(req, res) {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    const [category] = await conn.query(
      "SELECT id, name, description, image_url as imgSrc FROM categories WHERE id = ?",
      [id]
    );

    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Categoría no encontrada",
      });
    }

    res.json(category);
  } catch (err) {
    console.error("Error en getCategoryById:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener categoría",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/categories/:id/products
 * @desc    Obtener productos de una categoría
 * @access  Public
 */
async function getCategoryProducts(req, res) {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    // Verificar que la categoría existe
    const [category] = await conn.query(
      "SELECT id, name, description, image_url as imgSrc FROM categories WHERE id = ?",
      [id]
    );

    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Categoría no encontrada",
      });
    }

    // Obtener productos de la categoría
    const products = await conn.query(
      `
      SELECT
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id = ?
      ORDER BY p.sold_count DESC
    `,
      [id]
    );

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cost: Number(p.cost),
      currency: p.currency,
      soldCount: p.sold_count,
      image: p.image,
      category: {
        id: Number(id),
        name: category.name,
      },
      featured: Boolean(p.featured),
      stock: p.stock,
      flashSale: p.flash_sale_active
        ? {
            active: Boolean(p.flash_sale_active),
            price: Number(p.flash_sale_price),
            startsAt: p.flash_sale_starts_at,
            endsAt: p.flash_sale_ends_at,
          }
        : null,
    }));

    res.json({
      catName: category.name,
      imgSrc: category.imgSrc,
      description: category.description,
      products: formattedProducts,
    });
  } catch (err) {
    console.error("Error en getCategoryProducts:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener productos de la categoría",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
};
