import { useState } from "react";
import { createProduct, updateProduct, deleteProduct, uploadImage, deleteImage } from "../../api.js";
import { useSiteData } from "../../context/SiteDataContext.jsx";

const EMPTY_PRODUCT = { name: "", category: "", price: "", mrp: "", tag: "", image: "", imagePublicId: "", description: "" };

export default function ProductManager() {
  const { products, categories, refetch } = useSiteData();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const { url, publicId } = await uploadImage(file);
      setForm((f) => ({ ...f, image: url, imagePublicId: publicId }));
    } catch (err) {
      setMessage(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveImage() {
    if (form.imagePublicId) {
      try {
        await deleteImage(form.imagePublicId);
      } catch {
        // best effort — still clear from the form
      }
    }
    setForm((f) => ({ ...f, image: "", imagePublicId: "" }));
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      mrp: product.mrp || "",
      tag: product.tag || "",
      image: product.image,
      imagePublicId: "",
      description: product.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.image) {
      setMessage("Please upload a product image first.");
      return;
    }
    setSaving(true);
    setMessage("");
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      tag: form.tag || null,
      image: form.image,
      description: form.description,
    }; // imagePublicId is form-local only, never sent to the API
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      await refetch();
      cancelEdit();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      await refetch();
      if (editingId === id) cancelEdit();
    } catch (err) {
      setMessage(err.message || "Delete failed");
    }
  }

  return (
    <div className="admin-product-manager">
      <form className="admin-product-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
        <div className="admin-field-grid">
          <label className="admin-field">
            Name
            <input value={form.name} onChange={(e) => setField("name", e.target.value)} required />
          </label>
          <label className="admin-field">
            Category
            <input
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              list="admin-category-list"
              required
            />
            <datalist id="admin-category-list">
              {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label className="admin-field">
            Price
            <input type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
          </label>
          <label className="admin-field">
            MRP (optional, for discount)
            <input type="number" value={form.mrp} onChange={(e) => setField("mrp", e.target.value)} />
          </label>
          <label className="admin-field">
            Tag (e.g. Bestseller)
            <input value={form.tag} onChange={(e) => setField("tag", e.target.value)} />
          </label>
          <label className="admin-field">
            Product Image
            <input type="file" accept="image/*" onChange={handleImageFile} disabled={uploading} />
            {uploading && <span className="admin-upload-status">Uploading…</span>}
            {form.image && (
              <div className="admin-image-preview-wrap">
                <img src={form.image} alt="Preview" className="admin-image-preview" />
                <button type="button" className="admin-image-remove" onClick={handleRemoveImage}>
                  Remove
                </button>
              </div>
            )}
          </label>
        </div>
        <label className="admin-field admin-field-full">
          Description
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} />
        </label>
        {message && <p className="admin-form-message">{message}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      <div className="admin-product-list">
        <h2>Products ({products.length})</h2>
        <table className="admin-product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>MRP</th>
              <th>Tag</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><img src={p.image} alt={p.name} className="admin-product-thumb" /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.mrp ? `₹${p.mrp}` : "—"}</td>
                <td>{p.tag || "—"}</td>
                <td className="admin-product-actions">
                  <button type="button" onClick={() => startEdit(p)}>Edit</button>
                  <button type="button" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
