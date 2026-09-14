import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteData } from "../context/SiteDataContext.jsx";
import { whatsappLink } from "../lib/whatsapp.js";

export default function Header() {
  const { content, categories } = useSiteData();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  const activeCategory = new URLSearchParams(location.search).get("category");

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    let ticking = false;
    function update() {
      el.classList.toggle("scrolled", window.scrollY > 8);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!content) return null;

  const shopCategories = categories.filter((c) => c !== "All");

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        <Link to="/" className="header-logo-slot" onClick={() => setMenuOpen(false)}>
          {content.logoUrl && (
            <img src={content.logoUrl} alt={content.businessName || "Logo"} className="site-logo-img" />
          )}
          {content.businessName && <span className="logo">{content.businessName}</span>}
        </Link>

        <nav className="main-nav">
          <Link to="/">Home</Link>
          <div className="nav-dropdown">
            <span>Shop ▾</span>
            <div className="nav-dropdown-menu">
              <Link to="/#shop" className={!activeCategory ? "active" : ""}>All Products</Link>
              {shopCategories.map((cat) => (
                <Link
                  key={cat}
                  to={`/?category=${encodeURIComponent(cat)}#shop`}
                  className={activeCategory === cat ? "active" : ""}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
          <a href="#instagram">Instagram</a>
        </nav>

        <div className="header-actions">
          <a
            className="whatsapp-pill"
            href={whatsappLink(content.whatsappNumber, content.whatsappGeneralMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>

          <button
            type="button"
            className={"nav-toggle" + (menuOpen ? " open" : "")}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav className={"mobile-nav" + (menuOpen ? " open" : "")} aria-hidden={!menuOpen}>
        <div className="mobile-nav-inner">
          <Link to="/" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>Home</Link>
          <Link
            to="/#shop"
            className={!activeCategory ? "active" : ""}
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
          >
            All Products
          </Link>
          {shopCategories.map((cat) => (
            <Link
              key={cat}
              to={`/?category=${encodeURIComponent(cat)}#shop`}
              className={activeCategory === cat ? "active" : ""}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
            >
              {cat}
            </Link>
          ))}
          <a href="#instagram" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
            Instagram
          </a>
        </div>
      </nav>
    </header>
  );
}
