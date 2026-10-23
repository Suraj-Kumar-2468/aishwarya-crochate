import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { applyPricing } from "../utils/pricing.js";
import { fetchContent, fetchProducts } from "../api.js";

const SiteDataContext = createContext(null);
const CACHE_KEY = "site_data_v1";

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    return c?.content && Array.isArray(c.products) ? { ...c, products: c.products.map(applyPricing) } : null;
  } catch {
    return null;
  }
}

export function SiteDataProvider({ children }) {
  // Show last-seen data immediately and refresh in the background, so a slow or sleeping API doesn't blank the page.
  const [cached] = useState(readCache);
  const [content, setContent] = useState(cached?.content || null);
  const [products, setProducts] = useState(cached?.products || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const [contentData, productsData] = await Promise.all([fetchContent(), fetchProducts()]);
      setContent(contentData);
      setProducts(productsData.map(applyPricing));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ content: contentData, products: productsData }));
      } catch {
        /* cache is optional */
      }
    } catch (err) {
      if (!readCache()) setError(err.message || "Failed to load site data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!content?.theme) return;
    const root = document.documentElement.style;
    if (content.theme.primary) root.setProperty("--accent", content.theme.primary);
    if (content.theme.secondary) root.setProperty("--accent-hover", content.theme.secondary);
    if (content.theme.tertiary) {
      root.setProperty("--bg-soft", content.theme.tertiary);
      root.setProperty("--accent-soft", content.theme.tertiary);
    }
  }, [content?.theme]);

  const categories = content?.categories || ["All"];

  return (
    <SiteDataContext.Provider value={{ content, products, categories, loading, error, refetch }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used within SiteDataProvider");
  return ctx;
}

export function getProductById(products, id) {
  return products.find((p) => String(p.id) === String(id));
}
