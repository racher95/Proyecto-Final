/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

/*!40000 DROP DATABASE IF EXISTS `craftivity`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `craftivity` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `craftivity`;
DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `added_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  KEY `idx_cart` (`cart_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `added_at`, `updated_at`) VALUES (16,4,92,1,'2025-11-26 06:03:43','2025-11-26 06:03:43');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES (1,2,'2025-11-25 04:16:54','2025-11-25 04:16:54'),
(4,6,'2025-11-25 14:31:57','2025-11-25 14:31:57');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categories` (`id`, `name`, `description`, `image_url`, `created_at`, `updated_at`) VALUES (206,'Deportes & Fitness','Descubrí nuestra categoría de Deportes , diseñada para acompañarte en cada entrenamiento, desafio, objetivo personal.','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121987/categories/category_206_deportes_fitness.webp','2025-11-25 03:06:52','2025-11-26 01:53:07'),
(207,'Belleza y Cuidado Personal','Descubrí productos pensados para realzar tu bienestar y potenciar tu belleza natural. En esta categoría encontrarás opciones diseñadas para cuidarte por dentro y por fuera.','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121370/categories/category_207_belleza_y_cuidado_personal.jpg','2025-11-25 03:06:52','2025-11-26 01:42:50'),
(208,'Herramientas','Todo lo que necesitás para tus trabajos de reparación y construcción. Herramientas manuales y eléctricas de calidad, diseñadas para brindar precisión, resistencia y facilidad en cada proyecto.','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121371/categories/category_208_herramientas.jpg','2025-11-25 03:06:52','2025-11-26 01:42:51'),
(209,'Muebles','Descubrí muebles funcionales y modernos pensados para transformar cada ambiente. Encontrá opciones duraderas, cómodas y con estilo para crear espacios que se adapten a tu hogar y tu forma de vivir.','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764122857/categories/category_209_muebles.jpg','2025-11-25 03:06:52','2025-11-26 02:07:37'),
(210,'Juguetes','Descubre nuestra increíble selección de juguetes pensados para estimular la imaginación, la creatividad y el aprendizaje de los más pequeños . ¡Diversión, aventura y desarrollo en cada juego!','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121372/categories/category_210_juguetes.jpg','2025-11-25 03:06:52','2025-11-26 01:42:53'),
(211,'Cocina','Todo lo que necesitás para equipar y organizar tu cocina. Encontrá utensilios, electrodomésticos y accesorios funcionales y modernos que facilitan cada preparación y le dan estilo a tu espacio.','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121373/categories/category_211_cocina.jpg','2025-11-25 03:06:52','2025-11-26 01:42:53');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `rating` int(10) unsigned NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created` (`created_at` DESC),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `comments` (`id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES (1,61,2,5,'Excelente producto, muy buena calidad!','2025-11-25 04:20:55','2025-11-25 04:20:55'),
(2,82,6,1,'la pinza se rompio al primer uso','2025-11-25 18:59:08','2025-11-25 18:59:08'),
(3,71,14,3,'Muy bueno!','2025-10-07 03:16:59','2025-11-26 00:31:12'),
(4,71,15,5,'Me gusta, muy útil!!','2025-10-07 04:02:49','2025-11-26 00:31:12'),
(5,91,19,3,'me gusta, buena calidad','2025-10-08 16:22:14','2025-11-26 00:31:13'),
(6,61,6,5,'Excelente!','2025-11-26 05:55:09','2025-11-26 05:55:09');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int(10) unsigned NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_price`, `quantity`, `subtotal`, `created_at`) VALUES (1,1,61,'Kit de Yoga',2000.00,2,4000.00,'2025-11-25 04:19:28'),
(2,2,61,'Kit de Yoga',2000.00,1,2000.00,'2025-11-25 22:36:12'),
(3,2,92,'Kit De Cocina Bajo Mesada Mas Pileta',3500.00,1,3500.00,'2025-11-25 22:36:12'),
(4,2,112,'Juego De Ollas Antiadherente 17 Piezas Con Mango Removible',3999.00,1,3999.00,'2025-11-25 22:36:12'),
(5,3,62,'Kit Gonex Portable Home Gym',3000.00,1,3000.00,'2025-11-25 22:37:48'),
(6,4,61,'Kit de Yoga',2000.00,1,2000.00,'2025-11-25 23:03:04'),
(7,5,62,'Kit Gonex Portable Home Gym',3000.00,1,3000.00,'2025-11-25 23:11:39'),
(8,6,63,'Kit Pilates Athletic',1200.00,1,1200.00,'2025-11-25 23:48:57'),
(9,7,92,'Kit De Cocina Bajo Mesada Mas Pileta',3500.00,1,3500.00,'2025-11-25 23:50:07'),
(10,8,62,'Kit Gonex Portable Home Gym',3000.00,1,3000.00,'2025-11-26 05:52:51'),
(11,8,82,'Set Juego De Herramientas Daewoo',800.00,1,800.00,'2025-11-26 05:52:51'),
(12,8,112,'Juego De Ollas Antiadherente 17 Piezas Con Mango Removible',3999.00,1,3999.00,'2025-11-26 05:52:51');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_state` varchar(100) DEFAULT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `shipping_country` varchar(100) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at` DESC),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `orders` (`id`, `user_id`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`, `subtotal`, `shipping_cost`, `total`, `status`, `created_at`, `updated_at`) VALUES (1,2,'{\"department\":\"Montevideo\",\"locality\":\"Pocitos\",\"street\":\"Av. Brasil\",\"number\":\"2000\",\"corner\":\"21 de Setiembre\"}','Pocitos','Montevideo','11000','Uruguay',4000.00,0.00,4000.00,'pending','2025-11-25 04:19:28','2025-11-25 04:19:28'),
(2,6,'{\"department\":\"el depa\",\"locality\":\"la loca\",\"street\":\"calle mono\",\"number\":\"1234\",\"corner\":\"calle falsa\",\"apartment\":\"\"}','la loca','el depa','11000','Uruguay',9499.00,0.00,9499.00,'pending','2025-11-25 22:36:12','2025-11-25 22:36:12'),
(3,6,'{\"department\":\"asdfadsf\",\"locality\":\"asdfasdf\",\"street\":\"adsfsdf\",\"number\":\"12123\",\"corner\":\"asdfasdf\",\"apartment\":\"\"}','asdfasdf','asdfadsf','11000','Uruguay',3000.00,0.00,3000.00,'pending','2025-11-25 22:37:48','2025-11-25 22:37:48'),
(4,6,'{\"department\":\"el depa\",\"locality\":\"la loca\",\"street\":\"calle mono\",\"number\":\"1234\",\"corner\":\"calle falsa\",\"apartment\":\"\"}','la loca','el depa','11000','Uruguay',2000.00,0.00,2000.00,'pending','2025-11-25 23:03:04','2025-11-25 23:03:04'),
(5,6,'{\"department\":\"el reap\",\"locality\":\"la loca\",\"street\":\"calle mono\",\"number\":\"1234\",\"corner\":\"calle falsa\",\"apartment\":\"\"}','la loca','el reap','11000','Uruguay',3000.00,0.00,3000.00,'pending','2025-11-25 23:11:39','2025-11-25 23:11:39'),
(6,6,'{\"department\":\"el depa\",\"locality\":\"la loca\",\"street\":\"calle mono\",\"number\":\"1213\",\"corner\":\"calle falsa\",\"apartment\":\"\"}','la loca','el depa','11000','Uruguay',1200.00,0.00,1200.00,'pending','2025-11-25 23:48:57','2025-11-25 23:48:57'),
(7,6,'{\"department\":\"el depa\",\"locality\":\"la loca2\",\"street\":\"calle falsa\",\"number\":\"1234\",\"corner\":\"calle mono\",\"apartment\":\"\"}','la loca2','el depa','11000','Uruguay',3500.00,0.00,3500.00,'pending','2025-11-25 23:50:07','2025-11-25 23:50:07'),
(8,6,'{\"department\":\"prueba\",\"locality\":\"nose\",\"street\":\"calle\",\"number\":\"123\",\"corner\":\"corta\",\"apartment\":\"\"}','nose','prueba','11000','Uruguay',7799.00,0.00,7799.00,'pending','2025-11-26 05:52:51','2025-11-26 05:52:51');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_category` (`product_id`,`category_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `product_categories` (`id`, `product_id`, `category_id`, `created_at`) VALUES (1,61,206,'2025-11-25 03:10:48'),
(2,62,206,'2025-11-25 03:10:48'),
(3,63,206,'2025-11-25 03:10:48'),
(4,71,207,'2025-11-25 03:10:48'),
(5,72,207,'2025-11-25 03:10:48'),
(6,73,207,'2025-11-25 03:10:48'),
(7,81,208,'2025-11-25 03:10:48'),
(8,82,208,'2025-11-25 03:10:48'),
(9,83,208,'2025-11-25 03:10:48'),
(10,91,209,'2025-11-25 03:10:48'),
(11,92,209,'2025-11-25 03:10:48'),
(12,93,209,'2025-11-25 03:10:48'),
(13,101,210,'2025-11-25 03:10:48'),
(14,102,210,'2025-11-25 03:10:48'),
(15,103,210,'2025-11-25 03:10:48'),
(16,112,211,'2025-11-25 03:10:48'),
(17,113,211,'2025-11-25 03:10:48'),
(18,114,211,'2025-11-25 03:10:48');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(10) unsigned DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_primary` (`product_id`,`is_primary`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `display_order`, `created_at`) VALUES (1,61,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119127/products/product_61_0_1758285753641-0-yoga.webp',1,0,'2025-11-25 03:13:43'),
(2,62,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119145/products/product_62_0_1758286502306-0-Gonex-Portable-Home-Gym.webp',1,0,'2025-11-25 03:13:43'),
(3,62,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119152/products/product_62_1_1758286513861-0-Keep-Fitness-Everywhere.jpg',0,1,'2025-11-25 03:13:43'),
(4,62,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119162/products/product_62_2_1758286529209-0-Workout-System.jpg',0,2,'2025-11-25 03:13:43'),
(5,63,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119191/products/product_63_0_1758288810874-0-Pelota-Pilates-Athletic-65Cm-Anillo-Pilates-Banda-Elastica.jpg',1,0,'2025-11-25 03:13:44'),
(6,63,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119201/products/product_63_1_1758288819595-0-Pelota-Pilates-Athletic-65Cm-Anillo-Pilates-Banda-Elastica-3.jpg',0,1,'2025-11-25 03:13:44'),
(7,72,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119294/products/product_72_0_1758293210302-0-AD6C4C8F-B72A-47E0-ADBB-887FF96AD950.webp',1,0,'2025-11-25 03:13:44'),
(8,72,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119297/products/product_72_1_1758293226796-0-Hair-care-brand-Olaplex.webp',0,1,'2025-11-25 03:13:44'),
(9,73,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121337/products/product_73_0_1758296396887-0-vs2.png',1,0,'2025-11-25 03:13:44'),
(10,82,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121343/products/product_82_0_1758388255258-0-D_NQ_NP_2X_673187-MLA84852123405_052025-F.webp',1,0,'2025-11-25 03:13:44'),
(11,82,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121345/products/product_82_1_1758388305357-0-D_NQ_NP_2X_993545-MLA84554046522_052025-F.webp',0,1,'2025-11-25 03:13:44'),
(12,82,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121346/products/product_82_2_1758388323442-0-D_NQ_NP_2X_976584-MLA84852345601_052025-F.webp',0,2,'2025-11-25 03:13:44'),
(13,83,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121347/products/product_83_0_1758388935923-0-D_NQ_NP_2X_633455-MLA84832710911_052025-F.webp',1,0,'2025-11-25 03:13:44'),
(14,102,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121355/products/product_102_0_1758495817530-0-D_NQ_NP_2X_677695-MLA82154291989_012025-F.webp',1,0,'2025-11-25 03:13:45'),
(15,102,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121356/products/product_102_1_1758495830724-0-D_NQ_NP_2X_814950-MLA81218171614_122024-F.webp',0,1,'2025-11-25 03:13:45'),
(16,102,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121357/products/product_102_2_1758495840291-0-D_NQ_NP_2X_797963-MLA81874147218_012025-F.webp',0,2,'2025-11-25 03:13:45'),
(17,103,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121358/products/product_103_0_1758496203308-0-D_NQ_NP_2X_731680-MLA92054602561_092025-F.webp',1,0,'2025-11-25 03:13:45'),
(18,103,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121360/products/product_103_1_1758496219975-0-D_NQ_NP_2X_674008-MLU79372449173_092024-F.webp',0,1,'2025-11-25 03:13:45'),
(19,103,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121361/products/product_103_2_1758496230408-0-D_NQ_NP_2X_960928-MLA91654836946_092025-F.webp',0,2,'2025-11-25 03:13:45'),
(20,112,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121362/products/product_112_0_1758497937125-0-D_NQ_NP_2X_900199-MLU90805483880_082025-F.webp',1,0,'2025-11-25 03:13:45'),
(21,112,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121363/products/product_112_1_1758497947025-0-D_NQ_NP_2X_906007-MLU82272721502_022025-F.webp',0,1,'2025-11-25 03:13:45'),
(22,112,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121364/products/product_112_2_1758497956941-0-D_NQ_NP_2X_927714-MLU83177259031_032025-F.webp',0,2,'2025-11-25 03:13:45'),
(23,114,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121367/products/product_114_0_1758497656671-0-1000x1000-REPOS006-A.jpg',1,0,'2025-11-25 03:13:45'),
(24,114,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121368/products/product_114_1_1758497684571-0-4.webp',0,1,'2025-11-25 03:13:45'),
(25,71,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119224/products/product_71_0_1758291962518-0-ActivistSkincare-TrialandTravelKit_1946x.webp',1,0,'2025-11-25 03:13:45'),
(26,71,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119253/products/product_71_1_1758291978866-0-Trial-Kit-temp_1d154cfc-5cbe-4b0a-a757-156c5c6cdcef_1500x.webp',0,1,'2025-11-25 03:13:45'),
(27,71,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764119261/products/product_71_2_1758291987797-0-activist-skincare-cleansers_1fc92342-76ee-4097-8ff9-a773ceabbdc1_1500x.webp',0,2,'2025-11-25 03:13:45'),
(28,81,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121339/products/product_81_0_1758387861091-0-D_NQ_NP_2X_720593-MLA84839428085_052025-F.webp',1,0,'2025-11-25 03:13:46'),
(29,81,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121340/products/product_81_1_1758387869723-0-D_NQ_NP_2X_857335-MLA84839565371_052025-F.webp',0,1,'2025-11-25 03:13:46'),
(30,81,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121342/products/product_81_2_1758387878140-0-D_NQ_NP_2X_872758-MLA84839565419_052025-F.webp',0,2,'2025-11-25 03:13:46'),
(31,91,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121348/products/product_91_0_1758481801142-0-D_NQ_NP_2X_844312-MLA80192986927_102024-F.webp',1,0,'2025-11-25 03:13:46'),
(32,91,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121349/products/product_91_1_1758481817202-0-D_NQ_NP_2X_622713-MLU81804917114_012025-F.webp',0,1,'2025-11-25 03:13:46'),
(33,92,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121350/products/product_92_0_1758494415255-0-D_NQ_NP_2X_748719-MLA88425549809_072025-F.webp',1,0,'2025-11-25 03:13:46'),
(34,92,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121351/products/product_92_1_1758494442454-0-D_NQ_NP_2X_965129-MLA88425530083_072025-F.webp',0,1,'2025-11-25 03:13:46'),
(35,93,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121352/products/product_93_0_1758495006089-0-D_NQ_NP_2X_954158-MLA84836203041_052025-F.webp',1,0,'2025-11-25 03:13:46'),
(36,93,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121353/products/product_93_1_1758495021222-0-D_NQ_NP_2X_791833-MLA84538158124_052025-F.webp',0,1,'2025-11-25 03:13:46'),
(37,101,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121354/products/product_101_0_1758495432199-0-D_NQ_NP_2X_967917-MLU71371144527_082023-F.webp',1,0,'2025-11-25 03:13:46'),
(38,113,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121365/products/product_113_0_1758497315353-0-D_NQ_NP_2X_941816-MLU76911793418_062024-F.webp',1,0,'2025-11-25 03:13:46'),
(39,113,'https://res.cloudinary.com/dcdfqlivp/image/upload/v1764121366/products/product_113_1_1758497332802-0-D_NQ_NP_2X_740108-MLU77121357891_062024-F.webp',0,1,'2025-11-25 03:13:47');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `product_related`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_related` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `related_product_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relation` (`product_id`,`related_product_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_related` (`related_product_id`),
  CONSTRAINT `product_related_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_related_ibfk_2` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_related` WRITE;
/*!40000 ALTER TABLE `product_related` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `product_related` (`id`, `product_id`, `related_product_id`, `created_at`) VALUES (1,61,62,'2025-11-26 00:21:02'),
(2,61,63,'2025-11-26 00:21:02'),
(3,62,61,'2025-11-26 00:21:02'),
(4,62,63,'2025-11-26 00:21:02'),
(5,63,61,'2025-11-26 00:21:02'),
(6,63,62,'2025-11-26 00:21:02'),
(7,71,72,'2025-11-26 00:21:02'),
(8,71,73,'2025-11-26 00:21:02'),
(9,72,71,'2025-11-26 00:21:03'),
(10,72,73,'2025-11-26 00:21:03'),
(11,73,71,'2025-11-26 00:21:03'),
(12,73,72,'2025-11-26 00:21:03'),
(13,81,82,'2025-11-26 00:21:03'),
(14,81,83,'2025-11-26 00:21:03'),
(15,82,81,'2025-11-26 00:21:03'),
(16,82,83,'2025-11-26 00:21:03'),
(17,83,81,'2025-11-26 00:21:03'),
(18,83,82,'2025-11-26 00:21:03'),
(19,91,92,'2025-11-26 00:21:03'),
(20,91,93,'2025-11-26 00:21:03'),
(21,92,91,'2025-11-26 00:21:03'),
(22,92,93,'2025-11-26 00:21:03'),
(23,93,91,'2025-11-26 00:21:03'),
(24,93,92,'2025-11-26 00:21:03'),
(25,101,102,'2025-11-26 00:21:03'),
(26,101,103,'2025-11-26 00:21:03'),
(27,102,101,'2025-11-26 00:21:03'),
(28,102,103,'2025-11-26 00:21:03'),
(29,103,101,'2025-11-26 00:21:03'),
(30,103,102,'2025-11-26 00:21:03'),
(31,112,113,'2025-11-26 00:21:03'),
(32,112,114,'2025-11-26 00:21:03'),
(33,113,112,'2025-11-26 00:21:03'),
(34,113,114,'2025-11-26 00:21:03'),
(35,114,113,'2025-11-26 00:21:03'),
(36,114,112,'2025-11-26 00:21:03');
/*!40000 ALTER TABLE `product_related` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `sold_count` int(10) unsigned DEFAULT 0,
  `stock` int(10) unsigned DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `flash_sale_active` tinyint(1) DEFAULT 0,
  `flash_sale_price` decimal(10,2) DEFAULT NULL,
  `flash_sale_starts_at` datetime DEFAULT NULL,
  `flash_sale_ends_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_featured` (`featured`),
  KEY `idx_flash_sale` (`flash_sale_active`,`flash_sale_ends_at`),
  KEY `idx_cost` (`cost`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `products` (`id`, `name`, `description`, `cost`, `currency`, `sold_count`, `stock`, `featured`, `flash_sale_active`, `flash_sale_price`, `flash_sale_starts_at`, `flash_sale_ends_at`, `created_at`, `updated_at`) VALUES (61,'Kit de Yoga','Llevá tu experiencia de yoga al siguiente nivel con este kit de yoga 7 en 1. Diseñado tanto para quienes recién comienzan como para practicantes avanzados, este set es perfecto para usar en casa, en el gimnasio o en tu estudio.',2000.00,'UYU',10,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:02','2025-11-25 03:10:02'),
(62,'Kit Gonex Portable Home Gym','Lleva tu entrenamiento al siguiente nivel con el kit portátil de gimnasio en casa Gonex. Diseñado para ofrecer una experiencia completa y versátil, este kit es perfecto para quienes buscan mantenerse en forma sin salir de casa.',3000.00,'UYU',25,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:02','2025-11-25 03:10:02'),
(63,'Kit Pilates Athletic','Este completo set de Pilates está diseñado para ofrecerte una experiencia integral de entrenamiento en casa. Cada componente ha sido seleccionado para ayudarte a mejorar tu flexibilidad, fuerza y equilibrio.',1200.00,'UYU',15,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:02','2025-11-25 03:10:02'),
(71,'Activist Skincare Trial','Descubrí el cuidado facial consciente y efectivo con este exclusivo kit de prueba de Activist Skincare. Diseñado para que experimentes una rutina completa durante 2 a 3 semanas, este set incluye 7 mini productos de alta eficacia, ideales para todo tipo de piel.',1900.00,'UYU',30,100,1,0,NULL,NULL,NULL,'2025-11-25 03:10:02','2025-11-25 03:10:02'),
(72,'Kit Capilar Olaplex','Descubre el poder de Olaplex, el tratamiento revolucionario que transforma tu cabello desde el interior. Este kit completo está diseñado para reparar el daño, fortalecer la fibra capilar y proteger tu melena de los efectos agresivos de tintes, planchas y procesos químicos.',5000.00,'UYU',30,100,0,1,4000.00,'2025-09-19 14:48:00','2026-01-08 14:48:00','2025-11-25 03:10:46','2025-11-25 03:10:46'),
(73,'Set Natural Beauty Pomegranate Lotus','El Set Natural Beauty Pomegranate Lotus es un kit de cuidado corporal que combina productos aromáticos con ingredientes hidratantes para un ritual de belleza inspirado en la naturaleza.\n\nForma parte de la línea Natural Beauty Body Care, cuya filosofía es ofrecer fórmulas lujosas, eficaces, inspiradas en ingredientes botánicos, para lograr una piel suave, saludable y con aroma delicioso.',1600.00,'UYU',40,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(81,'Taladro De Impacto Inalámbrico Nappo','Este taladro de impacto inalámbrico NAPPO de 12V con batería recargable de 1500mAh y 2 velocidades es perfecto para realizar cualquier tarea de bricolaje en tu hogar.',1700.00,'UYU',40,100,1,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(82,'Set Juego De Herramientas Daewoo','Si estás buscando un set de herramientas completo y variado, el Set de Herramientas DAEWOO DAHTS100 es la opción ideal para ti. Con sus 100 piezas, este set te brindará todas las herramientas necesarias para cualquier proyecto de bricolaje o reparación que tengas en mente.',1000.00,'UYU',16,100,0,1,800.00,'2025-09-20 17:12:00','2025-12-24 17:12:00','2025-11-25 03:10:46','2025-11-25 03:10:46'),
(83,'Set 6 Destornilladores Ingco','Descubre el juego de destornilladores INGCO HKSD0628, una herramienta esencial para cualquier aficionado al bricolaje o profesional. Este conjunto incluye 6 piezas, cada una diseñada con un mango ergonómico de plástico que proporciona un agarre cómodo y seguro, facilitando su uso durante largas jornadas de trabajo. Fabricados en material CR-V, estos destornilladores garantizan durabilidad y resistencia ante el desgaste.',600.00,'UYU',21,100,0,1,500.00,'2025-09-20 14:23:00','2025-12-31 14:23:00','2025-11-25 03:10:46','2025-11-25 03:10:46'),
(91,'Comoda 6 Cajones 2 Mesas De Luz Madera Maciza Linea Mexicana','Dale a tu dormitorio el toque cálido y auténtico del diseño mexicano con este elegante set de cómoda de 6 cajones y 2 mesas de luz, fabricado en madera maciza de alta calidad. Su estilo rústico y robusto aporta carácter, durabilidad y funcionalidad a cualquier ambiente.',10000.00,'UYU',22,100,1,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(92,'Kit De Cocina Bajo Mesada Mas Pileta','Este conjunto de muebles de cocina es una opción económica y de alta calidad para aquellos que desean renovar o construir su cocina sin gastar demasiado.\nEl bajo mesada y la pila de acero inoxidable son duraderos y fáciles de mantener, y el mueble está construido en MDP, lo que lo hace más resistente a la humedad que el MDF tradicional.',5000.00,'UYU',40,100,1,1,3500.00,'2025-09-22 01:42:00','2026-01-01 01:42:00','2025-11-25 03:10:46','2025-11-25 03:10:46'),
(93,'Set de Estanterías Biblioteca Repisa Multiuso','Estas estanterías son perfectas para organizar y decorar cualquier espacio de tu hogar u oficina. Con un diseño moderno y elegante, están fabricadas en MDP, un material duradero y resistente.',4300.00,'UYU',26,100,1,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(101,'Set Para Crear Pulseras','Pulsera de bricolaje y diseño creativo: haz tu propia pulsera de estilo único. Solo la imaginación y la creatividad pueden limitar la fabricación de pulseras.',790.00,'UYU',30,100,1,1,690.00,'2025-09-20 23:00:00','2025-12-24 23:00:00','2025-11-25 03:10:46','2025-11-25 03:10:46'),
(102,'Kit de construcción Lego Jurassic World','Inspira a los niños de 3 años en adelante a explorar la pasión por las aventuras relacionadas con los dinosaurios con este kit de construcción de modelos de dinosaurios Little Eatie: T. rex que incluye divertidas opciones de juego y exhibición.',3000.00,'UYU',8,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(103,'Kit Caja De Herramientas 17 Partes','Descubre la Juguete Caja De Herramientas de 17 Pcs de la marca PolarB, un fascinante set diseñado para estimular la creatividad y la imaginación de los más pequeños. Con unas medidas de 18x11x12 cm, este juguete es perfecto para manos pequeñas. Recomendado para niños a partir de 3 años, este kit de fábrica es ideal para desarrollar habilidades motoras y de resolución de problemas',880.00,'UYU',29,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(112,'Juego De Ollas Antiadherente 17 Piezas Con Mango Removible','Si querés equipar tu cocina con lo mejor, esta Batería de Cocina Antiadherente de 13 Piezas es la opción ideal. Incluye ollas, sartenes y utensilios diseñados para que disfrutes de la mejor experiencia al cocinar.\nGracias a su revestimiento antiadherente de alta calidad, evita que los alimentos se peguen y facilita la limpieza. Su material de aluminio distribuye el calor de manera uniforme, asegurando una cocción eficiente y pareja',7800.00,'UYU',45,100,0,1,3999.00,'2025-09-22 08:16:00','2025-12-21 08:16:00','2025-11-25 03:10:46','2025-11-25 03:10:46'),
(113,'Juego De Ollas Cocina Batería Tramontina 56 Piezas Cubiertos','¿Te estas por mudar o solo queres renovar tu cocina?.\nFacilitamos tu trabajo con artículos que sabemos que no pueden faltar en tu cocina.\nConoce nuestros Set de Vajillas Completos.',4800.00,'UYU',23,100,1,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46'),
(114,'Set De Decoración Repostería Tortas Pasteleria 236 Piezas','Explorá tu pasión por la repostería con el Set de Repostería IMBACK de 236 piezas, un kit completo diseñado para que crees tortas, cupcakes y postres únicos con facilidad y precisión. Ideal tanto para principiantes como para reposteros experimentados.',1200.00,'UYU',29,100,0,0,NULL,NULL,NULL,'2025-11-25 03:10:46','2025-11-25 03:10:46');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `shipping_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_addresses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `street` varchar(255) NOT NULL,
  `number` varchar(20) NOT NULL,
  `corner` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `country` varchar(100) DEFAULT 'Uruguay',
  `postal_code` varchar(20) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_default` (`user_id`,`is_default`),
  CONSTRAINT `shipping_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `shipping_addresses` WRITE;
/*!40000 ALTER TABLE `shipping_addresses` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `shipping_addresses` (`id`, `user_id`, `street`, `number`, `corner`, `department`, `city`, `state`, `country`, `postal_code`, `is_default`, `created_at`, `updated_at`) VALUES (4,6,'calle falsa','1234','calle mono',NULL,'la loca2','el depa','Uruguay','234234',1,'2025-11-25 23:50:07','2025-11-25 23:50:07'),
(5,6,'calle','123','corta',NULL,'nose','prueba','Uruguay','123123',0,'2025-11-26 05:52:51','2025-11-26 05:52:51');
/*!40000 ALTER TABLE `shipping_addresses` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `theme` enum('light','dark') DEFAULT 'light',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `avatar_url`, `theme`, `created_at`, `updated_at`) VALUES (1,'admin','admin@craftivity.com','$2b$10$qqeCXBks.VbXO2dmkhI7Lu6mhVZzsuZiVOWzXZGW1XDvDm.fzH2Ce','Admin','User',NULL,'dark','2025-11-25 01:36:43','2025-11-25 05:47:15'),
(2,'testuser','kevincamara95@gmail.com','$2b$10$8FC8c8BK/ie0SRTuD6VW8eZMnIyyErRgbKdiW.wjdPybwNppY4XXe','testuser','',NULL,'dark','2025-11-25 04:16:54','2025-11-25 06:43:50'),
(6,'test01','kevincamara95@hotmail.com','$2b$10$U/58vsdSPT5m6aQyNSi3t.HspoT0fSv45UTpQ2DVSVuvC6tD/0MNG','Kevin','Camara','https://res.cloudinary.com/dcdfqlivp/image/upload/v1764137179/avatars/user_6.jpg','light','2025-11-25 14:31:57','2025-11-26 06:06:20'),
(7,'aa@gmail.com','aa@gmail.com@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','aa@gmail.com',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(8,'renzxavi@gmail.com','renzxavi@gmail.com@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','renzxavi@gmail.com',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(9,'Cavendish','cavendish@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','Cavendish',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(10,'joaquinazul@gmail.com','joaquinazul@gmail.com@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','joaquinazul@gmail.com',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(11,'kevin','kevin@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','kevin',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(12,'weqrwqer','weqrwqer@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','weqrwqer',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(13,'Thiago','thiago@example.com','$2b$10$yBLjoraOIQPqyKCQIQiZROm4deRTaaY6rMa/zEqqWfgv1IwdFFKpi','Thiago',NULL,NULL,'light','2025-11-26 00:31:08','2025-11-26 00:31:08'),
(14,'aa','aa@gmail.com','$2b$10$MMK0bVAG0ZEZXvRonvU0QOedb287BtKqyIrUHGwKIMQcoNIiF79/W','aa','User',NULL,'light','2025-11-26 00:31:12','2025-11-26 00:31:12'),
(15,'renzxavi','renzxavi@gmail.com','$2b$10$fHWhfByQ1Yn.445.MYHEcu2A903rw6cwowuPI/LN6kboGyl4jzE5i','renzxavi','User',NULL,'light','2025-11-26 00:31:12','2025-11-26 00:31:12'),
(19,'joaquinazul','joaquinazul@gmail.com','$2b$10$RvTH06F/DflKUPCKpFyTeugyaIuyUTYfLUIoIvru//U3siNwkntRq','joaquinazul','User',NULL,'light','2025-11-26 00:31:13','2025-11-26 00:31:13');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
DROP TABLE IF EXISTS `view_active_flash_sales`;
/*!50001 DROP VIEW IF EXISTS `view_active_flash_sales`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `view_active_flash_sales` AS SELECT
 1 AS `id`,
  1 AS `name`,
  1 AS `description`,
  1 AS `cost`,
  1 AS `currency`,
  1 AS `sold_count`,
  1 AS `stock`,
  1 AS `featured`,
  1 AS `flash_sale_active`,
  1 AS `flash_sale_price`,
  1 AS `flash_sale_starts_at`,
  1 AS `flash_sale_ends_at`,
  1 AS `created_at`,
  1 AS `updated_at`,
  1 AS `discount_percentage` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `view_featured_products`;
/*!50001 DROP VIEW IF EXISTS `view_featured_products`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `view_featured_products` AS SELECT
 1 AS `id`,
  1 AS `name`,
  1 AS `description`,
  1 AS `cost`,
  1 AS `currency`,
  1 AS `sold_count`,
  1 AS `stock`,
  1 AS `featured`,
  1 AS `flash_sale_active`,
  1 AS `flash_sale_price`,
  1 AS `flash_sale_starts_at`,
  1 AS `flash_sale_ends_at`,
  1 AS `created_at`,
  1 AS `updated_at` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `view_products_with_categories`;
/*!50001 DROP VIEW IF EXISTS `view_products_with_categories`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `view_products_with_categories` AS SELECT
 1 AS `id`,
  1 AS `name`,
  1 AS `description`,
  1 AS `cost`,
  1 AS `currency`,
  1 AS `sold_count`,
  1 AS `stock`,
  1 AS `featured`,
  1 AS `flash_sale_active`,
  1 AS `flash_sale_price`,
  1 AS `flash_sale_starts_at`,
  1 AS `flash_sale_ends_at`,
  1 AS `category_ids`,
  1 AS `category_names` */;
SET character_set_client = @saved_cs_client;

USE `craftivity`;
/*!50001 DROP VIEW IF EXISTS `view_active_flash_sales`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_active_flash_sales` AS select `p`.`id` AS `id`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`cost` AS `cost`,`p`.`currency` AS `currency`,`p`.`sold_count` AS `sold_count`,`p`.`stock` AS `stock`,`p`.`featured` AS `featured`,`p`.`flash_sale_active` AS `flash_sale_active`,`p`.`flash_sale_price` AS `flash_sale_price`,`p`.`flash_sale_starts_at` AS `flash_sale_starts_at`,`p`.`flash_sale_ends_at` AS `flash_sale_ends_at`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at`,round((`p`.`cost` - `p`.`flash_sale_price`) / `p`.`cost` * 100,0) AS `discount_percentage` from `products` `p` where `p`.`flash_sale_active` = 1 and `p`.`flash_sale_starts_at` <= current_timestamp() and `p`.`flash_sale_ends_at` >= current_timestamp() */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `view_featured_products`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_featured_products` AS select `p`.`id` AS `id`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`cost` AS `cost`,`p`.`currency` AS `currency`,`p`.`sold_count` AS `sold_count`,`p`.`stock` AS `stock`,`p`.`featured` AS `featured`,`p`.`flash_sale_active` AS `flash_sale_active`,`p`.`flash_sale_price` AS `flash_sale_price`,`p`.`flash_sale_starts_at` AS `flash_sale_starts_at`,`p`.`flash_sale_ends_at` AS `flash_sale_ends_at`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `products` `p` where `p`.`featured` = 1 order by `p`.`sold_count` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `view_products_with_categories`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_products_with_categories` AS select `p`.`id` AS `id`,`p`.`name` AS `name`,`p`.`description` AS `description`,`p`.`cost` AS `cost`,`p`.`currency` AS `currency`,`p`.`sold_count` AS `sold_count`,`p`.`stock` AS `stock`,`p`.`featured` AS `featured`,`p`.`flash_sale_active` AS `flash_sale_active`,`p`.`flash_sale_price` AS `flash_sale_price`,`p`.`flash_sale_starts_at` AS `flash_sale_starts_at`,`p`.`flash_sale_ends_at` AS `flash_sale_ends_at`,group_concat(distinct `c`.`id` order by `c`.`id` ASC separator ',') AS `category_ids`,group_concat(distinct `c`.`name` order by `c`.`name` ASC separator ', ') AS `category_names` from ((`products` `p` left join `product_categories` `pc` on(`p`.`id` = `pc`.`product_id`)) left join `categories` `c` on(`pc`.`category_id` = `c`.`id`)) group by `p`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

