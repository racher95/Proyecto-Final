# README - Backend Craftivity

## Backend API para E-commerce Craftivity

Este es el backend del proyecto Craftivity, una API REST construida con Node.js, Express y MariaDB.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v16 o superior → [Descargar Node.js](https://nodejs.org/)
- **MariaDB** v10.5 o superior (o MySQL v8.0+) → [Descargar MariaDB](https://mariadb.org/download/)
- **npm** (incluido con Node.js)
- **Git** (para clonar el repositorio)

---

## 🚀 Instalación Paso a Paso

### **PASO 1: Clonar el Repositorio**

```bash
git clone https://github.com/racher95/Proyecto-Final.git
cd Proyecto-Final
```

### **PASO 2: Instalar Dependencias del Backend**

```bash
cd backend
npm install
```

Esto instalará todas las librerías necesarias (Express, MariaDB, JWT, bcrypt, etc.)

### **PASO 3: Configurar Variables de Entorno**

Crea el archivo `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales (ver `.env.example` como referencia).

El archivo debe contener:
- Credenciales de base de datos (MariaDB)
- Credenciales de Cloudinary (almacenamiento de imágenes)
- JWT Secret (autenticación)
- Configuración del servidor (puerto, entorno)

### **PASO 4: Configurar MariaDB**

1. Asegúrate de que MariaDB esté corriendo:

```bash
# macOS (Homebrew)
brew services start mariadb

# Linux
sudo systemctl start mariadb

# Windows (CMD como administrador)
net start MySQL

# Windows (XAMPP)
# Iniciar desde el panel de control XAMPP
```

2. Verificar conexión:

```bash
mysql -u root -p
```

### **PASO 5: Importar la Base de Datos**

Desde la carpeta `backend/`, ejecuta:

```bash
# macOS / Linux
mysql -u root -p < sql/ecommerce.sql

# Windows (CMD)
mysql -u root -p < sql\ecommerce.sql

# Windows (PowerShell)
Get-Content sql\ecommerce.sql | mysql -u root -p
```

**Nota:** Usa el usuario `root` de MariaDB para importar. El script crea automáticamente el usuario `craftivity` que el backend utiliza para conectarse.

Esto creará:
- ✅ Base de datos `craftivity`
- ✅ Todas las tablas (users, products, categories, cart, orders, etc.)
- ✅ Datos de ejemplo (productos, categorías, usuarios de prueba)

**Verificar importación:**

```bash
mysql -u root -p craftivity -e "SHOW TABLES;"
```

Deberías ver 11 tablas: users, products, categories, cart, cart_items, orders, order_items, comments, product_images, product_categories, shipping_addresses.

### **PASO 6: Iniciar el Servidor Backend**

Desde la carpeta `backend/`:

**Modo desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📦 Entorno: development
✅ Conectado a MariaDB
```

**El backend está listo en:** `http://localhost:3000`

---

## 🌐 Configurar y Ejecutar el Frontend

### **PASO 7: Abrir el Frontend**

1. Navega a la carpeta raíz del proyecto:

```bash
cd ..  # Salir de backend/
```

2. Abre `index.html` en tu navegador:

**Opción 1 - Doble clic:**
- Navega a la carpeta del proyecto en tu explorador de archivos
- Doble clic en `index.html`

**Opción 2 - Servidor local (recomendado):**
```bash
# Con Python 3
python3 -m http.server 8080

# Con Node.js (si tienes http-server)
npx http-server -p 8080
```

Luego abre: `http://localhost:8080`

**Opción 3 - Live Server (VS Code):**
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

---

## 🔑 Credenciales de Prueba

Una vez que el frontend esté abierto, puedes iniciar sesión con:

```
Usuario: admin
Password: test123
```

O crear tu propia cuenta en la página de registro.

---

## 📡 Endpoints de la API

### **Base URL:** `http://localhost:3000/api`

### Autenticación (`/api/auth`)
- `POST /auth/register` - Registrar nuevo usuario (público)
- `POST /auth/login` - Iniciar sesión (público)
- `POST /auth/logout` - Cerrar sesión

### Productos (`/api/products`)
- `GET /products` - Listar todos los productos (público)
- `GET /products?category=id` - Filtrar por categoría
- `GET /products?search=texto` - Buscar productos
- `GET /products/featured` - Productos destacados
- `GET /products/flash-sales` - Ofertas flash activas
- `GET /products/:id` - Detalle de un producto
- `GET /products/:id/comments` - Comentarios de un producto
- `POST /products/:id/comments` - Agregar comentario (🔒 requiere login)

### Categorías (`/api/categories`)
- `GET /categories` - Listar todas las categorías (público)
- `GET /categories/:id` - Detalle de una categoría
- `GET /categories/:id/products` - Productos de una categoría

### Carrito (`/api/cart`) - 🔒 Requiere autenticación
- `GET /cart` - Ver mi carrito
- `POST /cart/items` - Agregar producto al carrito
- `PUT /cart/items/:id` - Actualizar cantidad de un item
- `DELETE /cart/items/:id` - Eliminar item del carrito
- `DELETE /cart` - Vaciar todo el carrito

### Órdenes (`/api/orders`) - 🔒 Requiere autenticación
- `GET /orders` - Ver mis órdenes
- `GET /orders/:id` - Detalle de una orden específica
- `POST /orders` - Crear nueva orden (checkout)

### Usuarios (`/api/users`)
- `GET /users/profile` - Mi perfil (🔒 requiere login)
- `PUT /users/profile` - Actualizar mi perfil (🔒 requiere login)
- `POST /users/profile/avatar` - Subir avatar (🔒 requiere login)
- `GET /users/:username` - Ver perfil público de otro usuario

### Direcciones de Envío (`/api/shipping-addresses`) - 🔒 Requiere autenticación
- `GET /shipping-addresses` - Mis direcciones guardadas
- `POST /shipping-addresses` - Agregar nueva dirección
- `PUT /shipping-addresses/:id` - Actualizar dirección
- `DELETE /shipping-addresses/:id` - Eliminar dirección

---

## 🔒 Autenticación JWT

El sistema usa **JSON Web Tokens** para autenticación.

### Obtener un token:

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "test123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "userId": 1,
    "username": "admin",
    "email": "admin@craftivity.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Usar el token en requests protegidos:

```bash
GET http://localhost:3000/api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El frontend maneja esto automáticamente guardando el token en `sessionStorage` o `localStorage`.

---

## 🛠️ Stack Tecnológico

### Backend:
- **Node.js** v18 - Runtime de JavaScript
- **Express** v4.18 - Framework web
- **MariaDB** v10.11 - Base de datos relacional
- **jsonwebtoken** - Autenticación JWT
- **bcryptjs** - Encriptación de contraseñas
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Gestión de variables de entorno
- **cloudinary** - Almacenamiento de imágenes en la nube

### Frontend:
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **Bootstrap 5.3** - Framework CSS
- **Font Awesome 6** - Iconos
- **Sass** - Preprocesador CSS

---

## 📁 Estructura del Proyecto

```
Proyecto-Final/
├── index.html                    # Página principal
├── pages/                        # Páginas HTML
│   ├── products.html
│   ├── product-details.html
│   ├── cart.html
│   ├── login.html
│   ├── profile.html
│   └── orders.html
├── Scripts/                      # JavaScript del frontend
│   ├── main.js                   # Funciones globales
│   ├── config.js                 # Configuración API
│   ├── products.js
│   ├── cart.js
│   ├── login.js
│   └── ...
├── CSS/                          # Estilos compilados
├── sass/                         # Archivos Sass
├── components/                   # Header y Footer
└── backend/                      # Backend Node.js
    ├── server.js                 # Punto de entrada
    ├── package.json
    ├── .env.example              # Plantilla de variables
    ├── sql/
    │   ├── ecommerce.sql         # ⭐ BASE DE DATOS COMPLETA
    │   └── backup/               # Archivos históricos
    ├── src/
    │   ├── config/
    │   │   └── db.js             # Conexión a MariaDB
    │   ├── routes/               # Definición de rutas
    │   ├── controllers/          # Lógica de negocio
    │   ├── middleware/           # Auth, validaciones
    │   └── models/               # (futuro)
    └── scripts/
        └── cleanup-avatars.js    # Script de mantenimiento
```

---

## 🗄️ Exportar/Respaldar la Base de Datos

Si necesitas crear un respaldo de la BD o exportar cambios:

### Exportar BD completa (estructura + datos):

```bash
mysqldump -u root -p \
  --databases craftivity \
  --complete-insert \
  --skip-comments \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-database \
  > sql/ecommerce.sql
```

**Explicación de flags:**
- `--databases craftivity` - Incluye la BD completa con CREATE DATABASE
- `--complete-insert` - Inserts completos (más legibles)
- `--skip-comments` - Sin comentarios auto-generados
- `--single-transaction` - Respaldo consistente (sin bloquear tablas)
- `--routines` - Incluye procedimientos almacenados
- `--triggers` - Incluye triggers
- `--add-drop-database` - Agrega DROP DATABASE IF EXISTS

### Exportar solo estructura (sin datos):

```bash
mysqldump -u root -p \
  --no-data \
  craftivity \
  > sql/estructura.sql
```

### Exportar solo datos (sin estructura):

```bash
mysqldump -u root -p \
  --no-create-info \
  craftivity \
  > sql/datos.sql
```

---

## 🚨 Troubleshooting

### Error: "Port 3000 is already in use"

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
# Luego: taskkill /PID <número_pid> /F

# Alternativa: cambiar puerto en .env
PORT=3001
```

### Frontend no conecta con backend

Verifica que `Scripts/config.js` apunte a `http://localhost:3000`

---

## 🧪 Testing de Endpoints

Puedes probar los endpoints con:

### Usando cURL:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test123"}'

# Obtener productos
curl http://localhost:3000/api/products

# Obtener categorías
curl http://localhost:3000/api/categories
```

### Usando Postman o Thunder Client:

1. Importa la colección de endpoints
2. Configura la variable `{{baseUrl}}` = `http://localhost:3000/api`
3. Para rutas protegidas, agrega header:
   - Key: `Authorization`
   - Value: `Bearer tu_token_aqui`

---

## 📝 Notas Importantes

### Imágenes
- Los productos usan imágenes almacenadas en **Cloudinary**
- Las URLs son públicas y funcionan sin configurar Cloudinary
- Solo necesitas configurarlo si quieres subir nuevas imágenes

### Base de Datos
- `sql/ecommerce.sql` - Archivo principal (estructura + datos completos)
- `sql/backup/` - Archivos históricos del desarrollo (solo referencia)

### Scripts útiles:

```bash
# Iniciar backend en desarrollo
npm run dev

# Iniciar backend en producción
npm start

# Compilar Sass (frontend)
npm run css:build

# Ver logs del servidor
npm start 2>&1 | tee server.log
```

---

## 👥 Proyecto

**Proyecto Final Grupo 7 - JAP 2025**

---

**Última actualización:** Noviembre 2025
**Versión:** 2.0.0
**Estado:** Producción ✅
