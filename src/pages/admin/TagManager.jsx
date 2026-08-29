import { useEffect, useState } from "react";
import { updateContent } from "../../api.js";
import { useSiteData } from "../../context/SiteDataContext.jsx";

export default function TagManager() {
  const { content, products, refetch } = useSiteData();
  const [tags, setTags] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (content) setTags([...(content.tags || [])]);
  }, [content]);

  if (!tags) return <p>Loading…</p>;

  function addTag() {
    const value = newTag.trim();
    if (!value || tags.includes(value)) return;
    setTags((list) => [...list, value]);
    setNewTag("");
  }

  function removeTag(tag) {
    setTags((list) => list.filter((t) => t !== tag));
  }

  const usageCount = (tag) => products.filter((p) => p.tag === tag).length;

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await updateContent({ ...content, tags });
      await refetch();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-tag-manager">
      <p className="admin-hint">
        Tags appear as a dropdown when adding or editing a product (e.g. Bestseller), and can be used to
        power a "Product Collection" section on the homepage.
      </p>

      <div className="admin-tag-list">
        {tags.map((tag) => (
          <div key={tag} className="admin-tag-chip">
            <span>{tag}</span>
            <span className="admin-tag-usage">{usageCount(tag)} product{usageCount(tag) === 1 ? "" : "s"}</span>
            <button type="button" onClick={() => removeTag(tag)}>×</button>
          </div>
        ))}
        {tags.length === 0 && <p className="admin-hint">No tags yet.</p>}
      </div>

      <div className="admin-tag-add">
        <input
          placeholder="New tag (e.g. Bestseller)"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
        />
        <button type="button" onClick={addTag}>+ Add Tag</button>
      </div>

      {message && <p className="admin-form-message">{message}</p>}
      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Tags"}
      </button>
    </div>
  );
}
