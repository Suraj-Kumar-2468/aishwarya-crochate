import { useSiteData } from "../context/SiteDataContext.jsx";
import useParallax from "../hooks/useParallax.js";

const SPEEDS = [0.04, -0.05, 0.06, -0.03, 0.05, -0.04];

function InstagramTile({ product, instagramUrl, position }) {
  const ref = useParallax(SPEEDS[position % SPEEDS.length], 14);
  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="instagram-tile"
      ref={ref}
    >
      <img src={product.images?.[0]?.url} alt={product.name} loading="lazy" />
    </a>
  );
}

export default function InstagramFeed({ title }) {
  const { content, products } = useSiteData();
  if (!content) return null;

  const tiles = products.slice(0, 6);

  return (
    <section className="instagram-section">
      <h2 className="section-title">{title ?? content.instagramTitle}</h2>
      <p className="instagram-handle">
        <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer">
          {content.instagramHandle}
        </a>
      </p>
      <div className="instagram-grid">
        {tiles.map((p, i) => (
          <InstagramTile key={p.id} product={p} instagramUrl={content.instagramUrl} position={i} />
        ))}
      </div>
    </section>
  );
}
