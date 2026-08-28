import { useParams, Link, Navigate } from "react-router-dom";
import { useSiteData, getProductById } from "../context/SiteDataContext.jsx";
import { whatsappLink, buyNowMessage } from "../lib/whatsapp.js";

export default function ProductDetail() {
  const { id } = useParams();
  const { content, products, loading } = useSiteData();

  if (loading) return null;

  const product = getProductById(products, id);
  if (!product) return <Navigate to="/" replace />;

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <main className="product-detail-page">
      <Link to="/" className="back-link">&larr; Back to shop</Link>
      <div className="product-detail">
        <img src={product.image} alt={product.name} className="product-detail-image" />
        <div className="product-detail-info">
          <div className="product-category">{product.category}</div>
          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-price-row">
            <span className="product-detail-price">₹{product.price}</span>
            {hasDiscount && (
              <>
                <span className="product-detail-mrp">₹{product.mrp}</span>
                <span className="product-discount-badge">{discountPct}% off</span>
              </>
            )}
          </div>
          <p className="product-detail-description">{product.description}</p>
          <a
            className="buy-now-btn buy-now-btn-large"
            href={whatsappLink(content?.whatsappNumber, buyNowMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy Now
          </a>
        </div>
      </div>
    </main>
  );
}
