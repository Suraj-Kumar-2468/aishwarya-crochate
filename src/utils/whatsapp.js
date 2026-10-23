const WHATSAPP_NUMBER = "919611662744"; // country code 91 + number, digits only

export const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

// items: [{ id, name, price, qty }]
export function whatsappUrl(items, subtotal) {
  const lines = items.map(
    (it, i) =>
      `${i + 1}. ${it.name} x ${it.qty} = ${rupees(it.price * it.qty)}\n   ${window.location.origin}/product/${it.id}`
  );
  const text = ["Hi! I'd like to order:", "", ...lines, "", `Subtotal: ${rupees(subtotal)}`].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
