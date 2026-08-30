import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useSiteData, getProductById } from "../context/SiteDataContext.jsx";
import { whatsappLink, buyNowMessage } from "../lib/whatsapp.js";
import { submitReview } from "../api.js";
import TrustBadges from "../components/TrustBadges.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { content, products, loading, refetch } = useSiteData();
  const [index, setIndex] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, text: "" });
  const [reviewMessage, setReviewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [starFilter, setStarFilter] = useState(0);

  if (loading) return null;

  const product = getProductById(products, id);
  if (!product) return <Navigate to="/" replace />;

  const images = product.images?.length ? product.images : [];
  const hasMultiple = images.length > 1;
  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));
  const filteredReviews = starFilter ? reviews.filter((r) => r.rating === starFilter) : reviews;

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewForm.name.trim()) {
      setReviewMessage("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setReviewMessage("");
    try {
      await submitReview(product.id, reviewForm);
      await refetch();
      setReviewForm({ name: "", rating: 5, text: "" });
      setReviewMessage("Thanks for your review!");
    } catch (err) {
      setReviewMessage(err.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

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

          {product.highlights?.length > 0 && (
            <ul className="product-highlights">
              {product.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}

          <a
            className="buy-now-btn buy-now-btn-large"
            href={whatsappLink(content?.whatsappNumber, buyNowMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy Now
          </a>

          {product.badges?.length > 0 && (
            <div className="product-badges">
              {product.badges.map((b, i) => (
                <div key={i} className="product-badge">
                  {b.icon && /^https?:\/\//.test(b.icon) ? (
                    <img src={b.icon} alt="" className="product-badge-icon-img" />
                  ) : (
                    <span className="product-badge-icon">{b.icon || "✓"}</span>
                  )}
                  <span className="product-badge-text">{b.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="product-delivery-info">
            <span>🚚 {content?.deliveryText}</span>
            {content?.freeDeliveryThreshold > 0 && (
              <span>🎁 Free delivery above ₹{content.freeDeliveryThreshold}</span>
            )}
          </div>

          {product.careInstructions && (
            <div className="product-care-info">
              <strong>Care Instructions</strong>
              <p>{product.careInstructions}</p>
            </div>
          )}
        </div>
      </div>

      <div className="full-bleed">
        <TrustBadges />
      </div>

      <section className="product-reviews-section full-bleed">
        <div className="product-reviews-inner">
          <h2 className="section-title">Reviews</h2>
          <div className="product-reviews-summary">
            {avgRating ? (
              <>
                <span className="product-reviews-avg">{avgRating} ★</span>
                <span>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </>
            ) : (
              <span>No reviews yet — be the first!</span>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="review-filter-bar">
              <button
                type="button"
                className={"review-filter-chip" + (starFilter === 0 ? " active" : "")}
                onClick={() => setStarFilter(0)}
              >
                All ({reviews.length})
              </button>
              {ratingCounts.map(({ n, count }) => (
                <button
                  key={n}
                  type="button"
                  className={"review-filter-chip" + (starFilter === n ? " active" : "")}
                  disabled={count === 0}
                  onClick={() => setStarFilter(n)}
                >
                  {n} ★ ({count})
                </button>
              ))}
            </div>
          )}

          {filteredReviews.length > 0 && (
            <div className="review-list">
              {filteredReviews.map((r, i) => (
                <div key={r._id || i} className="review-item">
                  <div className="review-item-header">
                    <span className="review-item-name">{r.name}</span>
                    <span className="testimonial-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  {r.text && <p className="review-item-text">{r.text}</p>}
                </div>
              ))}
            </div>
          )}
          {reviews.length > 0 && filteredReviews.length === 0 && (
            <p className="admin-hint">No reviews with this rating.</p>
          )}

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n <= reviewForm.rating ? "filled" : ""}
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              placeholder="Your name"
              value={reviewForm.name}
              onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
            />
            <textarea
              placeholder="Share your experience (optional)"
              rows={3}
              value={reviewForm.text}
              onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
            />
            {reviewMessage && <p className="admin-form-message">{reviewMessage}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
