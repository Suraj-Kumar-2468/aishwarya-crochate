import { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../context/SiteDataContext.jsx";
import { whatsappLink } from "../lib/whatsapp.js";

export default function Header() {
  const { content, categories } = useSiteData();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!content) return null;

  const shopCategories = categories.filter((c) => c !== "All");

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="header-logo-slot" onClick={() => setMenuOpen(false)}>
          {content.logoUrl ? (
            <img src={content.logoUrl} alt={content.businessName} className="site-logo-img" />
          ) : (
            <span className="logo">{content.businessName}</span>
          )}
        </Link>

        <nav className="main-nav">
          <Link to="/">Home</Link>
          <div className="nav-dropdown">
            <span>Shop ▾</span>
            <div className="nav-dropdown-menu">
              <Link to="/">All Products</Link>
              {shopCategories.map((cat) => (
                <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`}>{cat}</Link>
              ))}
            </div>
          </div>
          <a href="#testimonials">Reviews</a>
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

      {menuOpen && (
        <nav className="mobile-nav">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>All Products</Link>
          {shopCategories.map((cat) => (
            <Link
              key={cat}
              to={`/?category=${encodeURIComponent(cat)}`}
              onClick={() => setMenuOpen(false)}
            >
              {cat}
            </Link>
          ))}
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#instagram" onClick={() => setMenuOpen(false)}>Instagram</a>
        </nav>
      )}
    </header>
  );
}
