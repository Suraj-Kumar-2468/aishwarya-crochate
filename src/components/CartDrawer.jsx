import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart, MAX_QTY } from "../context/CartContext.jsx";
import { optimized } from "../utils/img.js";

const WHATSAPP_NUMBER = "919611662744"; // country code 91 + number, digits only

function whatsappUrl(items, subtotal) {
  const lines = items.map(
    (it, i) =>
      `${i + 1}. ${it.name} x ${it.qty} = ${rupees(it.price * it.qty)}\n   ${window.location.origin}/product/${it.id}`
  );
  const text = ["Hi! I'd like to order:", "", ...lines, "", `Subtotal: ${rupees(subtotal)}`].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function CartDrawer() {
  const { items, count, subtotal, setQty, remove, open, setOpen } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  return (
    <>
      <div className={"cart-overlay" + (open ? " open" : "")} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        className={"cart-drawer" + (open ? " open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!open}
      >
        <header className="cart-head">
          <h2>Your cart {count > 0 && <span>({count})</span>}</h2>
          <button type="button" className="cart-close" onClick={() => setOpen(false)} aria-label="Close cart" tabIndex={open ? 0 : -1}>
            &times;
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/#shop" className="btn btn-primary" onClick={() => setOpen(false)}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((it) => (
                <li key={it.id} className="cart-item">
                  <Link to={`/product/${it.id}`} onClick={() => setOpen(false)} className="cart-thumb">
                    {it.image && <img src={optimized(it.image, 160)} alt={it.name} width="72" height="72" loading="lazy" />}
                  </Link>
                  <div className="cart-info">
                    <Link to={`/product/${it.id}`} onClick={() => setOpen(false)} className="cart-name">
                      {it.name}
                    </Link>
                    <span className="cart-price">{rupees(it.price)}</span>
                    <div className="cart-qty">
                      <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label={`Decrease ${it.name}`}>
                        −
                      </button>
                      <span aria-live="polite">{it.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(it.id, it.qty + 1)}
                        disabled={it.qty >= MAX_QTY}
                        aria-label={`Increase ${it.name}`}
                      >
                        +
                      </button>
                      <button type="button" className="cart-remove" onClick={() => remove(it.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong className="cart-line">{rupees(it.price * it.qty)}</strong>
                </li>
              ))}
            </ul>

            <footer className="cart-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{rupees(subtotal)}</strong>
              </div>
              <p className="cart-note">Shipping and taxes are calculated at checkout.</p>
              <button type="button" className="btn btn-primary cart-checkout" disabled>
                Checkout (coming soon)
              </button>
              <a
                className="btn cart-whatsapp"
                href={whatsappUrl(items, subtotal)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy via WhatsApp
              </a>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
