// Cloudinary serves resized, modern-format (WebP/AVIF) copies when asked via URL transforms.
// Product photos are uploaded at full size, so requesting a card-sized copy cuts bytes by 5-10x.
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

export function optimized(url, width) {
  const m = CLOUDINARY.exec(url || "");
  return m ? `${m[1]}f_auto,q_auto,c_limit,w_${width}/${m[2]}` : url;
}

export function srcSet(url, widths) {
  if (!CLOUDINARY.test(url || "")) return undefined;
  return widths.map((w) => `${optimized(url, w)} ${w}w`).join(", ");
}
