export function whatsappLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buyNowMessage(product) {
  return `Hey! I am interested in this product: ${product.name} (₹${product.price})`;
}
