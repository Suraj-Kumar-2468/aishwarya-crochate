import { useEffect, useState } from "react";
import { updateContent, uploadImage } from "../../api.js";
import { useSiteData } from "../../context/SiteDataContext.jsx";

const TEXT_FIELDS = [
  ["businessName", "Business Name"],
  ["tagline", "Tagline"],
  ["announcementText", "Announcement Bar Text"],
  ["heroSubtitle", "Hero Subtitle"],
  ["heroButtonText", "Hero Button Text"],
  ["deliveryText", "Delivery Text"],
  ["freeDeliveryThreshold", "Free Delivery Above (₹)"],
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
    setField("testimonials", [...form.testimonials, { name: "", text: "", rating: 5, image: "" }]);
  }

  function removeTestimonial(index) {
    setField("testimonials", form.testimonials.filter((_, i) => i !== index));
  }

  async function handleTestimonialImage(index, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file, "testimonials");
      setTestimonial(index, "image", url);
    } catch (err) {
      setMessage(err.message || "Image upload failed");
    } finally {
      e.target.value = "";
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file, "brand");
      setField("logoUrl", url);
    } catch (err) {
      setMessage(err.message || "Logo upload failed");
    } finally {
      e.target.value = "";
    }
  }

  function setHeroSlide(index, key, value) {
    const slides = form.heroSlides.map((s, i) => (i === index ? { ...s, [key]: value } : s));
    setField("heroSlides", slides);
  }

  function addHeroSlide() {
    setField("heroSlides", [...form.heroSlides, { desktopImage: "", mobileImage: "", caption: "" }]);
  }

  function removeHeroSlide(index) {
    setField("heroSlides", form.heroSlides.filter((_, i) => i !== index));
  }

  async function handleHeroImage(index, key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file, "hero");
      setHeroSlide(index, key, url);
    } catch (err) {
      setMessage(err.message || "Image upload failed");
    } finally {
      e.target.value = "";
    }
  }

  function setTheme(key, value) {
    setField("theme", { ...form.theme, [key]: value });
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

      <fieldset className="admin-fieldset">
        <legend>Logo</legend>
        <div className="admin-image-preview-wrap">
          {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="admin-image-preview" />}
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
          {form.logoUrl && (
            <button type="button" className="admin-image-remove" onClick={() => setField("logoUrl", "")}>
              Remove
            </button>
          )}
        </div>
        <p className="admin-hint">Shown centered in the header and as the browser tab icon. Leave empty to show the business name as text instead.</p>
      </fieldset>

      <div className="admin-field-grid">
        {TEXT_FIELDS.map(([key, label]) => (
          <label key={key} className="admin-field">
            {label}
            <input value={form[key] || ""} onChange={(e) => setField(key, e.target.value)} />
          </label>
        ))}
      </div>

      <fieldset className="admin-fieldset">
        <legend>Theme Colors</legend>
        <div className="admin-field-grid">
          <label className="admin-field">
            Primary
            <input type="color" value={form.theme?.primary || "#6fae8e"} onChange={(e) => setTheme("primary", e.target.value)} />
          </label>
          <label className="admin-field">
            Secondary
            <input type="color" value={form.theme?.secondary || "#55916f"} onChange={(e) => setTheme("secondary", e.target.value)} />
          </label>
          <label className="admin-field">
            Tertiary
            <input type="color" value={form.theme?.tertiary || "#eff8f2"} onChange={(e) => setTheme("tertiary", e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>About Us</legend>
        <label className="admin-field admin-field-full">
          Title
          <input value={form.aboutTitle || ""} onChange={(e) => setField("aboutTitle", e.target.value)} />
        </label>
        <label className="admin-field admin-field-full">
          Body Text
          <textarea rows={5} value={form.aboutText || ""} onChange={(e) => setField("aboutText", e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Hero Slides</legend>
        {form.heroSlides.map((s, i) => (
          <div key={i} className="admin-testimonial-row">
            <div className="admin-list-row">
              <input placeholder="Caption" value={s.caption} onChange={(e) => setHeroSlide(i, "caption", e.target.value)} />
              <button type="button" onClick={() => removeHeroSlide(i)}>Remove</button>
            </div>
            <div className="admin-image-preview-wrap">
              {s.desktopImage && <img src={s.desktopImage} alt="Desktop" className="admin-image-preview" />}
              <label className="admin-field">
                Desktop (wide) image
                <input type="file" accept="image/*" onChange={(e) => handleHeroImage(i, "desktopImage", e)} />
              </label>
            </div>
            <div className="admin-image-preview-wrap">
              {s.mobileImage && <img src={s.mobileImage} alt="Mobile" className="admin-image-preview" />}
              <label className="admin-field">
                Mobile (vertical) image
                <input type="file" accept="image/*" onChange={(e) => handleHeroImage(i, "mobileImage", e)} />
              </label>
            </div>
          </div>
        ))}
        <button type="button" onClick={addHeroSlide}>+ Add Slide</button>
      </fieldset>

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
          <div key={i} className="admin-testimonial-row">
            <div className="admin-list-row admin-list-row-testimonial">
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
            <div className="admin-testimonial-photo">
              {t.image && <img src={t.image} alt={t.name} className="admin-image-preview admin-image-preview-round" />}
              <input type="file" accept="image/*" onChange={(e) => handleTestimonialImage(i, e)} />
            </div>
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
