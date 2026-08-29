import { useEffect, useState } from "react";
import { updateContent } from "../../api.js";
import { useSiteData } from "../../context/SiteDataContext.jsx";

const TEXT_FIELDS = [
  ["businessName", "Business Name"],
  ["tagline", "Tagline"],
  ["announcementText", "Announcement Bar Text"],
  ["heroTitle", "Hero Title"],
  ["heroTagline", "Hero Tagline"],
  ["heroSubtitle", "Hero Subtitle"],
  ["heroButtonText", "Hero Button Text"],
  ["heroImage", "Hero Image URL"],
  ["whatsappNumber", "WhatsApp Number"],
  ["whatsappGeneralMessage", "WhatsApp General Message"],
  ["footerText", "Footer Text"],
  ["instagramHandle", "Instagram Handle"],
  ["instagramUrl", "Instagram URL"],
  ["facebookUrl", "Facebook URL"],
];

export default function ContentEditor() {
  const { content, refetch } = useSiteData();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (content) setForm(content);
  }, [content]);

  if (!form) return <p>Loading…</p>;

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setCategory(index, value) {
    const categories = [...form.categories];
    categories[index] = value;
    setField("categories", categories);
  }

  function addCategory() {
    setField("categories", [...form.categories, ""]);
  }

  function removeCategory(index) {
    setField("categories", form.categories.filter((_, i) => i !== index));
  }

  function setTrustMarker(index, key, value) {
    const markers = form.trustMarkers.map((m, i) => (i === index ? { ...m, [key]: value } : m));
    setField("trustMarkers", markers);
  }

  function addTrustMarker() {
    setField("trustMarkers", [...form.trustMarkers, { icon: "", text: "" }]);
  }

  function removeTrustMarker(index) {
    setField("trustMarkers", form.trustMarkers.filter((_, i) => i !== index));
  }

  function setTestimonial(index, key, value) {
    const testimonials = form.testimonials.map((t, i) =>
      i === index ? { ...t, [key]: key === "rating" ? Number(value) : value } : t
    );
    setField("testimonials", testimonials);
  }

  function addTestimonial() {
    setField("testimonials", [...form.testimonials, { name: "", text: "", rating: 5 }]);
  }

  function removeTestimonial(index) {
    setField("testimonials", form.testimonials.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateContent(form);
      await refetch();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-content-form" onSubmit={handleSubmit}>
      <p className="admin-hint">Section titles and on/off toggles live under the Sections tab.</p>
      <div className="admin-field-grid">
        {TEXT_FIELDS.map(([key, label]) => (
          <label key={key} className="admin-field">
            {label}
            <input value={form[key] || ""} onChange={(e) => setField(key, e.target.value)} />
          </label>
        ))}
      </div>

      <fieldset className="admin-fieldset">
        <legend>Categories</legend>
        {form.categories.map((cat, i) => (
          <div key={i} className="admin-list-row">
            <input value={cat} onChange={(e) => setCategory(i, e.target.value)} />
            <button type="button" onClick={() => removeCategory(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addCategory}>+ Add Category</button>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Trust Markers</legend>
        {form.trustMarkers.map((m, i) => (
          <div key={i} className="admin-list-row">
            <input placeholder="Icon" value={m.icon} onChange={(e) => setTrustMarker(i, "icon", e.target.value)} />
            <input placeholder="Text" value={m.text} onChange={(e) => setTrustMarker(i, "text", e.target.value)} />
            <button type="button" onClick={() => removeTrustMarker(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addTrustMarker}>+ Add Trust Marker</button>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Testimonials</legend>
        {form.testimonials.map((t, i) => (
          <div key={i} className="admin-list-row admin-list-row-testimonial">
            <input placeholder="Name" value={t.name} onChange={(e) => setTestimonial(i, "name", e.target.value)} />
            <input placeholder="Text" value={t.text} onChange={(e) => setTestimonial(i, "text", e.target.value)} />
            <input
              placeholder="Rating"
              type="number"
              min="1"
              max="5"
              value={t.rating}
              onChange={(e) => setTestimonial(i, "rating", e.target.value)}
            />
            <button type="button" onClick={() => removeTestimonial(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addTestimonial}>+ Add Testimonial</button>
      </fieldset>

      {message && <p className="admin-form-message">{message}</p>}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save Content"}
      </button>
    </form>
  );
}
