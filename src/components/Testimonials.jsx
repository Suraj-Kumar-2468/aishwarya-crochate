import { useSiteData } from "../context/SiteDataContext.jsx";
import useReveal from "../hooks/useReveal.js";

export default function Testimonials({ title }) {
  const [titleRef, titleVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();
  const { content } = useSiteData();
  if (!content) return null;

  return (
    <section className="testimonials-section">
      <h2 ref={titleRef} className={"section-title reveal" + (titleVisible ? " visible" : "")}>
        {title ?? content.testimonialsTitle}
      </h2>
      <div ref={gridRef} className={"testimonials-grid" + (gridVisible ? " visible" : "")}>
        {content.testimonials.map((t, i) => (
          <div
            key={t.name}
            className="testimonial-card"
            style={{ transitionDelay: gridVisible ? `${i * 0.08}s` : "0s" }}
          >
            {t.image && <img src={t.image} alt={t.name} className="testimonial-avatar" />}
            <div className="testimonial-stars">{"★".repeat(t.rating)}</div>
            <p className="testimonial-text">"{t.text}"</p>
            <p className="testimonial-name">- {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
