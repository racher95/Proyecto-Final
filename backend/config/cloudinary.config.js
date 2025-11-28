const cloudinary = require("cloudinary").v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube una imagen a Cloudinary
 * @param {string} imageBuffer - Buffer o path de la imagen
 * @param {string} folder - Carpeta en Cloudinary (ej: 'avatars')
 * @param {string} publicId - ID público personalizado (opcional)
 * @returns {Promise<object>} - Objeto con URL y datos de la imagen
 */
const uploadImage = async (
  imageBuffer,
  folder = "ecommerce",
  publicId = null
) => {
  try {
    const options = {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 500, height: 500, crop: "limit" }, // Limitar tamaño máximo
        { quality: "auto" }, // Calidad automática
        { fetch_format: "auto" }, // Formato automático (webp, etc.)
      ],
    };

    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true; // Sobrescribir si ya existe
    }

    const result = await cloudinary.uploader.upload(imageBuffer, options);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Error subiendo imagen a Cloudinary:", error);
    throw new Error("Error al subir la imagen");
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise<object>} - Resultado de la eliminación
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error eliminando imagen de Cloudinary:", error);
    throw new Error("Error al eliminar la imagen");
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
};
