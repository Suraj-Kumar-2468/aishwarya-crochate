import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal.js";
import { whatsappLink, buyNowMessage } from "../lib/whatsapp.js";
import { useSiteData } from "../context/SiteDataContext.jsx";

export default function ProductCard({ product }) {
  const [ref, visible] = useReveal();
  const { content } = useSiteData();

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div ref={ref} className={"product-card" + (visible ? " visible" : "")}>
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image-wrap">
          {product.tag && <span className={"product-tag tag-" + product.tag.toLowerCase()}>{product.tag}</span>}
          {hasDiscount && <span className="product-discount-badge">{discountPct}% off</span>}
          <img src={product.image} alt={product.name} loading="lazy" />
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
