import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../../api.js";
import ContentEditor from "./ContentEditor.jsx";
import ProductManager from "./ProductManager.jsx";

export default function AdminDashboard() {
  const [tab, setTab] = useState("products");
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <button type="button" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "products" ? "admin-tab active" : "admin-tab"}
          onClick={() => setTab("products")}
        >
          Products
        </button>
        <button
          type="button"
          className={tab === "content" ? "admin-tab active" : "admin-tab"}
          onClick={() => setTab("content")}
        >
          Site Content
        </button>
      </div>

      {tab === "products" ? <ProductManager /> : <ContentEditor />}
    </main>
  );
}
