import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useSiteData, getProductById } from "../context/SiteDataContext.jsx";
import { whatsappLink, buyNowMessage } from "../lib/whatsapp.js";

export default function ProductDetail() {
  const { id } = useParams();
  const { content, products, loading } = useSiteData();
  const [index, setIndex] = useState(0);

  if (loading) return null;

  const product = getProductById(products, id);
  if (!product) return <Navigate to="/" replace />;

  const images = product.images?.length ? product.images : [];
  const hasMultiple = images.length > 1;

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <main className="product-detail-page">
      <Link to="/" className="back-link">&larr; Back to shop</Link>
      <div className="product-detail">
        <div className="product-detail-gallery">
          <div className="product-detail-image-wrap">
            <img src={images[index]?.url} alt={product.name} className="product-detail-image" />
            {hasMultiple && (
              <>
                <button type="button" className="image-nav image-nav-prev" onClick={prev} aria-label="Previous image">
                  &#8249;
                </button>
                <button type="button" className="image-nav image-nav-next" onClick={next} aria-label="Next image">
                  &#8250;
                </button>
              </>
            )}
          </div>
          {hasMultiple && (
            <div className="product-detail-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={"product-detail-thumb" + (i === index ? " active" : "")}
                  onClick={() => setIndex(i)}
                >
                  <img src={img.url} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
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
