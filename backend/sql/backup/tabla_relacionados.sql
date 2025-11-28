-- ============================================
-- TABLA: product_related
-- Descripción: Relaciones N:M entre productos relacionados
-- ============================================

USE craftivity;

CREATE TABLE IF NOT EXISTS product_related (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  related_product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE,

  UNIQUE KEY unique_relation (product_id, related_product_id),
  INDEX idx_product (product_id),
  INDEX idx_related (related_product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
