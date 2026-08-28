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
