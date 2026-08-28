import { useSiteData } from "../context/SiteDataContext.jsx";

export default function Footer() {
  const { content } = useSiteData();
  if (!content) return null;

  return (
    <footer className="site-footer">
      <div className="footer-socials">
        <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={content.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</a>
      </div>
      <p>&copy; 2026 {content.businessName}. {content.footerText}</p>
    </footer>
  );
}
