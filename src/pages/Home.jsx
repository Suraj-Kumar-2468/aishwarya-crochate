import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useSiteData } from "../context/SiteDataContext.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import CollectionRow from "../components/CollectionRow.jsx";
import Testimonials from "../components/Testimonials.jsx";
import InstagramFeed from "../components/InstagramFeed.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import AboutUs from "../components/AboutUs.jsx";
import useReveal from "../hooks/useReveal.js";

export default function Home() {
  const { content, products, categories, loading, error } = useSiteData();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [active, setActive] = useState(searchParams.get("category") || "All");
  const [titleRef, titleVisible] = useReveal();

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl && categories.includes(fromUrl)) setActive(fromUrl);
  }, [searchParams, categories]);

  useEffect(() => {
    if (location.hash !== "#shop") return;
    const el = document.getElementById("shop");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, location.search]);

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
          <HeroCarousel
            key={section.id}
            slides={content.heroSlides || []}
            tagline={content.tagline}
            subtitle={content.heroSubtitle}
            buttonText={content.heroButtonText}
          />
        );

      case "aboutUs":
        return <AboutUs key={section.id} title={section.title || content.aboutTitle} text={content.aboutText} />;

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
              {items.map((product, i) => (
                <ProductCard key={product.id} product={product} position={i} />
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
