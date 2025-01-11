const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.split(".")[0];
  } catch (error) {
    console.error("Error extracting public_id:", error.message);
    throw new Error("Invalid Cloudinary URL format");
  }
};

export default extractPublicId;