import data from "./products.json";

export const categories = data.categories;
export const products = data.products;

export function getProductById(id) {
  return products.find((p) => String(p.id) === String(id));
}
