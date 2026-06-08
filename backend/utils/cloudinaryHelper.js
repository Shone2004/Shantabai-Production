const cloudinary = require("../config/cloudinary");

/**
 * Uploads a file buffer (from Multer memory storage) to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<string>} The uploaded image secure URL
 */
const uploadBuffer = (fileBuffer, folder = "shantabai") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Uploads a base64 encoded image string directly to Cloudinary.
 * @param {string} base64Str - The base64 image data URL (e.g. data:image/png;base64,...)
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<string>} The uploaded image secure URL
 */
const uploadBase64 = async (base64Str, folder = "shantabai") => {
  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder,
    });
    return result.secure_url;
  } catch (error) {
    throw error;
  }
};

/**
 * Main helper to upload either a base64 string or a file buffer to Cloudinary.
 * @param {string|Buffer} imageInput - The base64 string or file buffer/object
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<string>} Secure URL
 */
const uploadToCloudinary = async (imageInput, folder = "shantabai") => {
  if (!imageInput) return null;

  // Case 1: If it's a Multer file object or buffer
  if (Buffer.isBuffer(imageInput)) {
    return await uploadBuffer(imageInput, folder);
  }
  if (imageInput.buffer && Buffer.isBuffer(imageInput.buffer)) {
    return await uploadBuffer(imageInput.buffer, folder);
  }

  // Case 2: If it's a base64 string (should start with data:image/)
  if (typeof imageInput === "string" && imageInput.startsWith("data:image/")) {
    return await uploadBase64(imageInput, folder);
  }

  // Case 3: If it's already a URL, just return it
  if (typeof imageInput === "string" && (imageInput.startsWith("http://") || imageInput.startsWith("https://"))) {
    return imageInput;
  }

  throw new Error("Invalid image input format. Must be a base64 string, URL, or Buffer.");
};

module.exports = {
  uploadBuffer,
  uploadBase64,
  uploadToCloudinary,
};
