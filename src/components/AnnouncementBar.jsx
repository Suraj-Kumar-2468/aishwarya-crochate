import { useSiteData } from "../context/SiteDataContext.jsx";

export default function AnnouncementBar() {
  const { content } = useSiteData();
  if (!content) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        <span>{content.announcementText}</span>
        <span>{content.announcementText}</span>
      </div>
    </div>
  );
}
