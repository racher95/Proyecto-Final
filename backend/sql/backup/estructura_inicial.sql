-- ============================================
-- CRAFTIVITY E-COMMERCE DATABASE SCHEMA
-- ============================================
-- Versión: 1.0
-- Motor: MariaDB/MySQL con InnoDB
-- Charset: utf8mb4_unicode_ci
-- ============================================

-- Eliminar base de datos si existe (opcional, comentado por seguridad)
-- DROP DATABASE IF EXISTS craftivity;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS craftivity
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE craftivity;

-- ============================================
-- TABLA: users
-- Descripción: Usuarios del sistema
-- ============================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(500),
    theme ENUM('light', 'dark') DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: categories
-- Descripción: Categorías de productos
-- ============================================
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: products
-- Descripción: Productos del catálogo
-- ============================================
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    sold_count INT UNSIGNED DEFAULT 0,
    stock INT UNSIGNED DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,

    -- Flash Sales
    flash_sale_active BOOLEAN DEFAULT FALSE,
    flash_sale_price DECIMAL(10, 2),
    flash_sale_starts_at DATETIME,
    flash_sale_ends_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_name (name),
    INDEX idx_featured (featured),
    INDEX idx_flash_sale (flash_sale_active, flash_sale_ends_at),
    INDEX idx_cost (cost)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: product_categories
-- Descripción: Relación N:M entre productos y categorías
-- ============================================
CREATE TABLE product_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,

    UNIQUE KEY unique_product_category (product_id, category_id),
    INDEX idx_product (product_id),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: product_images
-- Descripción: Imágenes de productos (múltiples por producto)
-- ============================================
CREATE TABLE product_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

    INDEX idx_product (product_id),
    INDEX idx_primary (product_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: comments
-- Descripción: Comentarios/reviews de productos
-- ============================================
CREATE TABLE comments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    rating INT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: carts
-- Descripción: Carritos de compra (uno por usuario)
-- ============================================
CREATE TABLE carts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: cart_items
-- Descripción: Items dentro de cada carrito
-- ============================================
CREATE TABLE cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

    UNIQUE KEY unique_cart_product (cart_id, product_id),
    INDEX idx_cart (cart_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: orders
-- Descripción: Órdenes de compra
-- ============================================
CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,

    -- Información de envío
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,

    -- Totales
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,

    -- Estado
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: order_items
-- Descripción: Items dentro de cada orden
-- ============================================
CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(200) NOT NULL,  -- Snapshot del nombre
    product_price DECIMAL(10, 2) NOT NULL,  -- Snapshot del precio
    quantity INT UNSIGNED NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,  -- price * quantity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,

    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Productos con sus categorías
CREATE OR REPLACE VIEW view_products_with_categories AS
SELECT
    p.id,
    p.name,
    p.description,
    p.cost,
    p.currency,
    p.sold_count,
    p.stock,
    p.featured,
    p.flash_sale_active,
    p.flash_sale_price,
    p.flash_sale_starts_at,
    p.flash_sale_ends_at,
    GROUP_CONCAT(DISTINCT c.id ORDER BY c.id) AS category_ids,
    GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS category_names
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id;

-- Vista: Productos en oferta flash activos
CREATE OR REPLACE VIEW view_active_flash_sales AS
SELECT
    p.*,
    ROUND((p.cost - p.flash_sale_price) / p.cost * 100) AS discount_percentage
FROM products p
WHERE p.flash_sale_active = TRUE
  AND p.flash_sale_starts_at <= NOW()
  AND p.flash_sale_ends_at >= NOW();

-- Vista: Productos destacados
CREATE OR REPLACE VIEW view_featured_products AS
SELECT p.*
FROM products p
WHERE p.featured = TRUE
ORDER BY p.sold_count DESC;

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Usuario de prueba (password: "test123" hasheado con bcrypt)
-- NOTA: Este hash es solo un ejemplo, generar uno real al migrar
INSERT INTO users (username, email, password_hash, first_name, last_name, theme) VALUES
('admin', 'admin@craftivity.com', '$2a$10$example.hash.placeholder.for.test123', 'Admin', 'User', 'dark');

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
