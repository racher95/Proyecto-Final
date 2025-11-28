const { pool } = require("../config/db");

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros opcionales
 * @query   category, search, featured, flash_sale
 * @access  Public
 */
async function getAllProducts(req, res) {
  const { category, search, featured, flash_sale } = req.query;

  let conn;
  try {
    conn = await pool.getConnection();

    let query = `
      SELECT
        p.*,
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_names,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    // Filtro por categoría
    if (category) {
      query += " AND c.id = ?";
      params.push(category);
    }

    // Filtro por búsqueda
    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filtro por destacados
    if (featured === "true") {
      query += " AND p.featured = 1";
    }

    // Filtro por flash sales activos
    if (flash_sale === "true") {
      query +=
        " AND p.flash_sale_active = 1 AND p.flash_sale_starts_at <= NOW() AND p.flash_sale_ends_at >= NOW()";
    }

    query += " GROUP BY p.id ORDER BY p.id";

    const products = await conn.query(query, params);

    // Formatear respuesta
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cost: Number(p.cost),
      currency: p.currency,
      soldCount: p.sold_count,
      stock: p.stock,
      image: p.image,
      category: p.category_ids ? Number(p.category_ids.split(",")[0]) : null,
      categoryName: p.category_names ? p.category_names.split(", ")[0] : null,
      featured: Boolean(p.featured),
      flashSale: p.flash_sale_active
        ? {
            active: Boolean(p.flash_sale_active),
            price: Number(p.flash_sale_price),
            startsAt: p.flash_sale_starts_at,
            endsAt: p.flash_sale_ends_at,
            discount: Math.round(
              ((p.cost - p.flash_sale_price) / p.cost) * 100
            ),
          }
        : null,
    }));

    res.json(formattedProducts);
  } catch (err) {
    console.error("Error en getAllProducts:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener productos",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/products/featured
 * @desc    Obtener productos destacados
 * @access  Public
 */
async function getFeaturedProducts(req, res) {
  let conn;
  try {
    conn = await pool.getConnection();

    const products = await conn.query(`
      SELECT
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_names
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.featured = 1
      GROUP BY p.id
      ORDER BY p.sold_count DESC
    `);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cost: Number(p.cost),
      currency: p.currency,
      soldCount: p.sold_count,
      image: p.image,
      category: {
        id: p.category_ids ? Number(p.category_ids.split(",")[0]) : null,
        name: p.category_names ? p.category_names.split(", ")[0] : null,
      },
      featured: true,
      stock: p.stock,
    }));

    res.json(formattedProducts);
  } catch (err) {
    console.error("Error en getFeaturedProducts:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener productos destacados",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/products/flash-sales
 * @desc    Obtener productos en oferta flash activos
 * @access  Public
 */
async function getFlashSales(req, res) {
  let conn;
  try {
    conn = await pool.getConnection();

    const products = await conn.query(`
      SELECT
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_names,
        ROUND((p.cost - p.flash_sale_price) / p.cost * 100) as discount
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.flash_sale_active = 1
        AND p.flash_sale_starts_at <= NOW()
        AND p.flash_sale_ends_at >= NOW()
      GROUP BY p.id
      ORDER BY discount DESC
    `);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cost: Number(p.cost),
      currency: p.currency,
      soldCount: p.sold_count,
      image: p.image,
      category: {
        id: p.category_ids ? Number(p.category_ids.split(",")[0]) : null,
        name: p.category_names ? p.category_names.split(", ")[0] : null,
      },
      featured: Boolean(p.featured),
      stock: p.stock,
      flashSale: {
        active: true,
        price: Number(p.flash_sale_price),
        startsAt: p.flash_sale_starts_at,
        endsAt: p.flash_sale_ends_at,
      },
      flashPrice: Number(p.flash_sale_price),
      discount: Number(p.discount),
    }));

    res.json({
      catName: "Hot Sales!",
      description: "Ofertas por tiempo limitado - ¡No te las pierdas!",
      products: formattedProducts,
    });
  } catch (err) {
    console.error("Error en getFlashSales:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener ofertas flash",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/products/:id
 * @desc    Obtener producto por ID
 * @access  Public
 */
async function getProductById(req, res) {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    // Obtener producto
    const [product] = await conn.query(
      `
      SELECT p.* FROM products p WHERE p.id = ?
    `,
      [id]
    );

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Producto no encontrado",
      });
    }

    // Obtener imágenes
    const images = await conn.query(
      "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order",
      [id]
    );

    // Obtener categorías
    const categories = await conn.query(
      `
      SELECT c.id, c.name
      FROM categories c
      JOIN product_categories pc ON c.id = pc.category_id
      WHERE pc.product_id = ?
    `,
      [id]
    );

    // Obtener productos relacionados
    const relatedProductsData = await conn.query(
      `
      SELECT
        p.id, p.name, p.cost, p.currency, p.featured, p.stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order LIMIT 1) as image
      FROM product_related pr
      JOIN products p ON pr.related_product_id = p.id
      WHERE pr.product_id = ?
      ORDER BY pr.id
      LIMIT 10
    `,
      [id]
    );

    // Formatear productos relacionados
    const relatedProducts = relatedProductsData.map((rp) => ({
      id: rp.id,
      name: rp.name,
      image: rp.image || null,
      cost: Number(rp.cost),
      currency: rp.currency,
      featured: Boolean(rp.featured),
      stock: rp.stock,
    }));

    // Formatear respuesta
    const response = {
      id: product.id,
      name: product.name,
      description: product.description,
      cost: Number(product.cost),
      currency: product.currency,
      soldCount: product.sold_count,
      stock: product.stock,
      images: images.map((img) => img.image_url),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      featured: Boolean(product.featured),
      relatedProducts: relatedProducts,
    };

    if (product.flash_sale_active) {
      response.flashSale = {
        active: true,
        price: Number(product.flash_sale_price),
        startsAt: product.flash_sale_starts_at,
        endsAt: product.flash_sale_ends_at,
      };
    }

    res.json(response);
  } catch (err) {
    console.error("Error en getProductById:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener producto",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   GET /api/products/:id/comments
 * @desc    Obtener comentarios de un producto
 * @access  Public
 */
async function getProductComments(req, res) {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();

    const comments = await conn.query(
      `
      SELECT
        c.id,
        c.rating as score,
        c.comment as description,
        c.created_at as dateTime,
        u.username as user,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.product_id = ?
      ORDER BY c.created_at DESC
    `,
      [id]
    );

    res.json(comments);
  } catch (err) {
    console.error("Error en getProductComments:", err);
    res.status(500).json({
      error: true,
      message: "Error al obtener comentarios",
    });
  } finally {
    if (conn) conn.release();
  }
}

/**
 * @route   POST /api/products/:id/comments
 * @desc    Agregar comentario a un producto
 * @access  Private (requiere autenticación)
 */
async function addComment(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId; // Del middleware verifyToken

  // Validación
  if (!rating || !comment) {
    return res.status(400).json({
      error: true,
      message: "Rating y comment son requeridos",
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      error: true,
      message: "Rating debe estar entre 1 y 5",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Verificar que el producto existe
    const [product] = await conn.query("SELECT id FROM products WHERE id = ?", [
      id,
    ]);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Producto no encontrado",
      });
    }

    // Insertar comentario
    await conn.query(
      "INSERT INTO comments (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [id, userId, rating, comment]
    );

    res.status(201).json({
      success: true,
      message: "Comentario agregado exitosamente",
    });
  } catch (err) {
    console.error("Error en addComment:", err);
    res.status(500).json({
      error: true,
      message: "Error al agregar comentario",
    });
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getFlashSales,
  getProductById,
  getProductComments,
  addComment,
};
