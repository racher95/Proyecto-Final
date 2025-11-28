/**
 * Script para limpiar avatares huérfanos de Cloudinary
 * Compara los avatares en Cloudinary con los que están en la base de datos
 * y elimina los que no tienen referencia
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const cloudinary = require("cloudinary").v2;
const mariadb = require("mariadb");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configurar MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce",
  connectionLimit: 5,
});

/**
 * Obtiene todos los avatares de Cloudinary en la carpeta 'avatars'
 */
async function getCloudinaryAvatars() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "avatars/",
      max_results: 500,
    });

    return result.resources.map((resource) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      createdAt: resource.created_at,
      bytes: resource.bytes,
    }));
  } catch (error) {
    console.error("❌ Error obteniendo recursos de Cloudinary:", error);
    throw error;
  }
}

/**
 * Obtiene todos los avatar_url de la base de datos
 */
async function getDatabaseAvatars() {
  let conn;
  try {
    conn = await pool.getConnection();

    const users = await conn.query(
      'SELECT id, username, avatar_url FROM users WHERE avatar_url IS NOT NULL AND avatar_url != ""'
    );

    return users.map((user) => ({
      userId: user.id,
      username: user.username,
      url: user.avatar_url,
    }));
  } catch (error) {
    console.error("❌ Error consultando base de datos:", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Extrae el publicId de una URL de Cloudinary
 */
function extractPublicId(url) {
  if (!url || !url.includes("cloudinary")) return null;

  const urlParts = url.split("/");
  const uploadIndex = urlParts.indexOf("upload");

  if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) return null;

  // Saltar versión (v1234...) y obtener folder/filename
  const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
  return publicIdWithExt.split(".")[0]; // Remover extensión
}

/**
 * Función principal
 */
async function cleanupOrphanedAvatars(dryRun = true) {
  console.log("🔍 Iniciando análisis de avatares...\n");

  try {
    // 1. Obtener avatares de Cloudinary
    console.log("📥 Obteniendo avatares de Cloudinary...");
    const cloudinaryAvatars = await getCloudinaryAvatars();
    console.log(
      `   ✅ Encontrados ${cloudinaryAvatars.length} avatares en Cloudinary\n`
    );

    // 2. Obtener avatares de la base de datos
    console.log("📥 Obteniendo avatares de la base de datos...");
    const dbAvatars = await getDatabaseAvatars();
    console.log(
      `   ✅ Encontrados ${dbAvatars.length} usuarios con avatar en DB\n`
    );

    // 3. Extraer publicIds usados en la DB
    const usedPublicIds = new Set();
    dbAvatars.forEach((avatar) => {
      const publicId = extractPublicId(avatar.url);
      if (publicId) {
        usedPublicIds.add(publicId);
      }
    });

    console.log(`   📋 Public IDs en uso: ${usedPublicIds.size}\n`);

    // 4. Identificar huérfanos
    const orphanedAvatars = cloudinaryAvatars.filter(
      (avatar) => !usedPublicIds.has(avatar.publicId)
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 RESUMEN:`);
    console.log(`   Total en Cloudinary: ${cloudinaryAvatars.length}`);
    console.log(`   En uso en DB: ${usedPublicIds.size}`);
    console.log(`   Huérfanos: ${orphanedAvatars.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (orphanedAvatars.length === 0) {
      console.log("✅ No hay avatares huérfanos. Todo está limpio!\n");
      return;
    }

    // 5. Mostrar avatares huérfanos
    console.log("🗑️  AVATARES HUÉRFANOS ENCONTRADOS:\n");
    orphanedAvatars.forEach((avatar, index) => {
      const sizeKB = (avatar.bytes / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${avatar.publicId}`);
      console.log(`      URL: ${avatar.url}`);
      console.log(
        `      Creado: ${new Date(avatar.createdAt).toLocaleString()}`
      );
      console.log(`      Tamaño: ${sizeKB} KB\n`);
    });

    // 6. Eliminar si no es dry-run
    if (!dryRun) {
      console.log("🗑️  Eliminando avatares huérfanos...\n");

      let deletedCount = 0;
      let failedCount = 0;

      for (const avatar of orphanedAvatars) {
        try {
          await cloudinary.uploader.destroy(avatar.publicId);
          console.log(`   ✅ Eliminado: ${avatar.publicId}`);
          deletedCount++;
        } catch (error) {
          console.log(
            `   ❌ Error eliminando ${avatar.publicId}: ${error.message}`
          );
          failedCount++;
        }
      }

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`✅ Eliminados: ${deletedCount}`);
      console.log(`❌ Fallidos: ${failedCount}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } else {
      console.log("ℹ️  MODO DRY-RUN (simulación)");
      console.log(
        "   Para eliminar realmente, ejecuta: node cleanup-avatars.js --delete\n"
      );
    }
  } catch (error) {
    console.error("\n❌ Error durante la limpieza:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar script
const isDryRun = !process.argv.includes("--delete");

cleanupOrphanedAvatars(isDryRun)
  .then(() => {
    console.log("✅ Script completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script falló:", error);
    process.exit(1);
  });
