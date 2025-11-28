-- ============================================
-- MIGRATION: Agregar tabla de direcciones de envío
-- ============================================
-- Descripción: Agrega tabla shipping_addresses para almacenar
--              direcciones de envío de usuarios
-- Fecha: 2025-11-25
-- ============================================

USE craftivity;

-- ============================================
-- TABLA: shipping_addresses
-- Descripción: Direcciones de envío de usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,

    -- Datos de envío
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    corner VARCHAR(255),
    department VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Uruguay',
    postal_code VARCHAR(20),

    -- Marcar como dirección predeterminada
    is_default BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user (user_id),
    INDEX idx_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Asegurar que solo haya una dirección default por usuario
-- ============================================
DELIMITER $$

CREATE TRIGGER before_insert_shipping_address
BEFORE INSERT ON shipping_addresses
FOR EACH ROW
BEGIN
    -- Si la nueva dirección es default, quitar default de las demás
    IF NEW.is_default = TRUE THEN
        UPDATE shipping_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id;
    END IF;
END$$

CREATE TRIGGER before_update_shipping_address
BEFORE UPDATE ON shipping_addresses
FOR EACH ROW
BEGIN
    -- Si se marca como default, quitar default de las demás
    IF NEW.is_default = TRUE AND OLD.is_default = FALSE THEN
        UPDATE shipping_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Verificación
-- ============================================
SELECT 'Tabla shipping_addresses creada exitosamente' AS status;
DESCRIBE shipping_addresses;
