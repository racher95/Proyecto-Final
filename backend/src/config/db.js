const mariadb = require("mariadb");
require("dotenv").config();

// Crear pool de conexiones para MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "craftivity",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  charset: "utf8mb4",
});

// Función helper para obtener una conexión
async function getConnection() {
  try {
    const conn = await pool.getConnection();
    return conn;
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
    throw err;
  }
}

// Función para verificar la conexión
async function testConnection() {
  let conn;
  try {
    conn = await getConnection();
    return true;
  } catch (err) {
    console.error("❌ Error al conectar a MariaDB:", err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  pool,
  getConnection,
  testConnection,
};
