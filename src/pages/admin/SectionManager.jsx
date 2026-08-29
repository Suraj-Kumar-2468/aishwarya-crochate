import { useEffect, useState } from "react";
import { updateContent } from "../../api.js";
import { useSiteData } from "../../context/SiteDataContext.jsx";

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner", needsTitle: false, needsTag: false },
  { value: "trustBadges", label: "Trust Badges", needsTitle: false, needsTag: false },
  { value: "collection", label: "Product Collection (by tag)", needsTitle: true, needsTag: true },
  { value: "shop", label: "Shop / Catalog", needsTitle: true, needsTag: false },
  { value: "testimonials", label: "Testimonials", needsTitle: true, needsTag: false },
  { value: "instagram", label: "Instagram Feed", needsTitle: true, needsTag: false },
];

function typeInfo(type) {
  return SECTION_TYPES.find((t) => t.value === type) || SECTION_TYPES[0];
}

function makeId() {
  return "section-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function SectionManager() {
  const { content, refetch } = useSiteData();
  const [sections, setSections] = useState(null);
  const [newType, setNewType] = useState("collection");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (content) setSections([...(content.sections || [])].sort((a, b) => a.order - b.order));
  }, [content]);

  if (!sections) return <p>Loading…</p>;

  const tags = content.tags || [];

  function update(id, patch) {
    setSections((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updateSettings(id, patch) {
    setSections((list) =>
      list.map((s) => (s.id === id ? { ...s, settings: { ...s.settings, ...patch } } : s))
    );
  }

  function remove(id) {
    setSections((list) => list.filter((s) => s.id !== id));
  }

  function move(index, dir) {
    setSections((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function addSection() {
    const info = typeInfo(newType);
    setSections((list) => [
      ...list,
      {
        id: makeId(),
        type: newType,
        enabled: true,
        order: list.length,
        title: info.needsTitle ? info.label : "",
        settings: info.needsTag ? { tag: tags[0] || "" } : {},
      },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const ordered = sections.map((s, i) => ({ ...s, order: i }));
      await updateContent({ ...content, sections: ordered });
      await refetch();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-section-manager">
      <p className="admin-hint">
        Turn sections on or off, reorder them, and control what data each one shows on the homepage.
      </p>

      <div className="admin-section-list">
        {sections.map((section, i) => {
          const info = typeInfo(section.type);
          return (
            <div key={section.id} className={"admin-section-row" + (section.enabled ? "" : " admin-section-row-off")}>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => update(section.id, { enabled: e.target.checked })}
                />
                <span className="admin-switch-track"><span className="admin-switch-thumb" /></span>
              </label>

              <div className="admin-section-body">
                <div className="admin-section-type">{info.label}</div>

                {info.needsTitle && (
                  <input
                    className="admin-section-title-input"
                    placeholder="Section title"
                    value={section.title}
                    onChange={(e) => update(section.id, { title: e.target.value })}
                  />
                )}

                {info.needsTag && (
                  <select
                    value={section.settings?.tag || ""}
                    onChange={(e) => updateSettings(section.id, { tag: e.target.value })}
                  >
                    <option value="">— choose tag —</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="admin-section-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1}>↓</button>
                <button type="button" onClick={() => remove(section.id)}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-section-add">
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          {SECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button type="button" onClick={addSection}>+ Add Section</button>
      </div>

      {message && <p className="admin-form-message">{message}</p>}
      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Sections"}
      </button>
    </div>
  );
}
