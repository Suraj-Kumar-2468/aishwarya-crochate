import { useState } from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal.js";
import { whatsappLink, buyNowMessage } from "../lib/whatsapp.js";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function ProductCard({ product }) {
  const [ref, visible] = useReveal();
  const { content } = useSiteData();
  const [index, setIndex] = useState(0);

  const images = product.images?.length ? product.images : [];
  const hasMultiple = images.length > 1;

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  function prev(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <div ref={ref} className={"product-card" + (visible ? " visible" : "")}>
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image-wrap">
          {product.tag && <span className={"product-tag tag-" + product.tag.toLowerCase()}>{product.tag}</span>}
          {hasDiscount && <span className="product-discount-badge">{discountPct}% off</span>}
          <img src={images[index]?.url} alt={product.name} loading="lazy" />
          {hasMultiple && (
            <>
              <button type="button" className="image-nav image-nav-prev" onClick={prev} aria-label="Previous image">
                &#8249;
              </button>
              <button type="button" className="image-nav image-nav-next" onClick={next} aria-label="Next image">
                &#8250;
              </button>
              <div className="image-nav-dots">
                {images.map((_, i) => (
                  <span key={i} className={"image-nav-dot" + (i === index ? " active" : "")} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="product-info">
          <div className="product-category">{product.category}</div>
          <div className="product-name">{product.name}</div>
          <div className="product-price-row">
            <span className="product-price">₹{product.price}</span>
            {hasDiscount && <span className="product-mrp">₹{product.mrp}</span>}
          </div>
        </div>
      </Link>
      <a
        className="buy-now-btn"
        href={whatsappLink(content?.whatsappNumber, buyNowMessage(product))}
        target="_blank"
        rel="noopener noreferrer"
      >
        Buy Now
      </a>
    </div>
  );
}
