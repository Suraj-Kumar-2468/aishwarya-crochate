import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSiteData } from "../context/SiteDataContext.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import CollectionRow from "../components/CollectionRow.jsx";
import Testimonials from "../components/Testimonials.jsx";
import InstagramFeed from "../components/InstagramFeed.jsx";
import useReveal from "../hooks/useReveal.js";
import heroBanner from "../assets/hero-banner.png";

export default function Home() {
  const { content, products, categories, loading, error } = useSiteData();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(searchParams.get("category") || "All");
  const [heroRef, heroVisible] = useReveal();
  const [titleRef, titleVisible] = useReveal();

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl && categories.includes(fromUrl)) setActive(fromUrl);
  }, [searchParams, categories]);

  const items = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.category === active)),
    [active, products]
  );

  if (loading) return <main className="site-loading">Loading…</main>;
  if (error) return <main className="site-error">Could not load the shop. Please refresh.</main>;
  if (!content) return null;

  const sections = [...(content.sections || [])]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  function renderSection(section) {
    switch (section.type) {
      case "hero":
        return (
          <section
            key={section.id}
            id="top"
            ref={heroRef}
            className={"hero reveal" + (heroVisible ? " visible" : "")}
            style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.85)), url(${heroBanner})` }}
          >
            <div className="hero-content">
              <p className="hero-eyebrow">{content.tagline}</p>
              <h1 className="hero-title">
                <span className="hero-title-main">{content.heroTitle}</span>
                <span className="hero-title-tagline">{content.heroTagline}</span>
              </h1>
              <p className="hero-sub">{content.heroSubtitle}</p>
              <a href="#shop" className="btn btn-primary">{content.heroButtonText}</a>
            </div>
          </section>
        );

      case "trustBadges":
        return <TrustBadges key={section.id} />;

      case "collection": {
        const tag = section.settings?.tag;
        const filtered = tag ? products.filter((p) => p.tag === tag) : products;
        return <CollectionRow key={section.id} title={section.title} items={filtered} />;
      }

      case "shop":
        return (
          <section key={section.id} id="shop" className="shop-section">
            <h2 ref={titleRef} className={"section-title reveal" + (titleVisible ? " visible" : "")}>
              {section.title}
            </h2>
            <CategoryFilter categories={categories} active={active} onChange={setActive} />
            <div className="catalog">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case "testimonials":
        return (
          <div key={section.id} id="testimonials">
            <Testimonials title={section.title} />
          </div>
        );

      case "instagram":
        return (
          <div key={section.id} id="instagram">
            <InstagramFeed title={section.title} />
          </div>
        );

      default:
        return null;
    }
  }

  const hero = sections.find((s) => s.type === "hero");
  const rest = sections.filter((s) => s.type !== "hero");

  return (
    <>
      {hero && renderSection(hero)}
      <main>{rest.map(renderSection)}</main>
    </>
  );
}
