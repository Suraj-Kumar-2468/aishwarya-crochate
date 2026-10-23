// The admin may enter the two prices in either order. Whatever the order, the lower number is what the
// customer pays and the higher number is shown struck through. The prices as typed stay available as
// rawPrice/rawMrp so the admin form shows what the owner entered.
export function applyPricing(product) {
  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const rawPrice = product.rawPrice ?? product.price;
  const rawMrp = product.rawMrp ?? product.mrp;
  if (!mrp || mrp === price) return { ...product, rawPrice, rawMrp, mrp: undefined };
  return { ...product, rawPrice, rawMrp, price: Math.min(price, mrp), mrp: Math.max(price, mrp) };
}
