import { useSiteData } from "../context/SiteDataContext.jsx";

export default function TrustBadges() {
  const { content } = useSiteData();
  if (!content) return null;

  return (
    <div className="trust-badges">
      {content.trustMarkers.map((marker) => (
        <div key={marker.text} className="trust-badge">
          <span className="trust-badge-icon">{marker.icon}</span>
          <span>{marker.text}</span>
        </div>
      ))}
    </div>
  );
}
