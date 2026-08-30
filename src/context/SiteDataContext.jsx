import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchContent, fetchProducts } from "../api.js";

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [content, setContent] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentData, productsData] = await Promise.all([fetchContent(), fetchProducts()]);
      setContent(contentData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message || "Failed to load site data");
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
