import { useSiteData } from "../context/SiteDataContext.jsx";

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
        {tiles.map((p) => (
          <a
            key={p.id}
            href={content.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-tile"
          >
            <img src={p.images?.[0]?.url} alt={p.name} loading="lazy" />
          </a>
        ))}
      </div>
    </section>
  );
}
