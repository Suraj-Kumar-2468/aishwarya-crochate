import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSiteData } from "./SiteDataContext.jsx";

const CartContext = createContext(null);
const STORAGE_KEY = "cart_v1";
export const MAX_QTY = 10;

function load() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { products } = useSiteData();
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: the cart still works for this visit */
    }
  }, [items]);

  // Keep the cart honest: refresh name/price/image from the live catalogue and drop deleted products.
  useEffect(() => {
    if (!products.length) return;
    setItems((current) => {
      const next = current
        .map((it) => {
          const p = products.find((x) => String(x.id) === String(it.id));
          return p ? { ...it, name: p.name, price: p.price, image: p.images?.[0]?.url || "" } : null;
        })
        .filter(Boolean);
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [products]);

  const add = useCallback((product, qty = 1) => {
    setItems((current) => {
      const existing = current.find((it) => it.id === String(product.id));
      if (existing) {
        return current.map((it) =>
          it.id === existing.id ? { ...it, qty: Math.min(MAX_QTY, it.qty + qty) } : it
        );
      }
      return [
        ...current,
        {
          id: String(product.id),
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || "",
          qty: Math.min(MAX_QTY, qty),
        },
      ];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((current) =>
      qty < 1
        ? current.filter((it) => it.id !== id)
        : current.map((it) => (it.id === id ? { ...it, qty: Math.min(MAX_QTY, qty) } : it))
    );
  }, []);

  const remove = useCallback((id) => setItems((c) => c.filter((it) => it.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, it) => n + it.qty, 0),
      subtotal: items.reduce((sum, it) => sum + it.price * it.qty, 0),
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
    }),
    [items, add, setQty, remove, clear, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
