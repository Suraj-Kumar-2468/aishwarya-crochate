import { useSiteData } from "../context/SiteDataContext.jsx";
import useReveal from "../hooks/useReveal.js";

export default function Testimonials({ title }) {
  const [ref, visible] = useReveal();
  const { content } = useSiteData();
  if (!content) return null;

  return (
    <section className="testimonials-section">
      <h2 ref={ref} className={"section-title reveal" + (visible ? " visible" : "")}>
        {title ?? content.testimonialsTitle}
      </h2>
      <div className="testimonials-grid">
        {content.testimonials.map((t) => (
          <div key={t.name} className="testimonial-card">
            {t.image && <img src={t.image} alt={t.name} className="testimonial-avatar" />}
            <div className="testimonial-stars">{"★".repeat(t.rating)}</div>
            <p className="testimonial-text">"{t.text}"</p>
            <p className="testimonial-name">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
