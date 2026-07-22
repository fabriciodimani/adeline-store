const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function normalizeImage(img) {
  if (!img) return "/brand/adeline-logo-transparent.png";

  const s = String(img);

  if (s.startsWith("http")) return s;
  if (s.startsWith("/")) return s;

  return `${API}/api/products/image/${s}`;
}

export function getProductImages(product) {
  if (!product) return ["/brand/adeline-logo-transparent.png"];

  // Prioridad 1:
  // Fotos subidas desde Admin a GridFS
  if (Array.isArray(product.imageIds) && product.imageIds.length) {
    return product.imageIds.map((id) => `${API}/api/products/image/${id}`);
  }

  // Prioridad 2:
  // Fotos demo o URLs viejas del seed
  if (Array.isArray(product.images) && product.images.length) {
    return product.images.map(normalizeImage);
  }

  if (product.imageId) {
    return [`${API}/api/products/image/${product.imageId}`];
  }

  if (product.image) {
    return [normalizeImage(product.image)];
  }

  return ["/brand/adeline-logo-transparent.png"];
}

export function getProductMainImage(product) {
  return getProductImages(product)[0];
}