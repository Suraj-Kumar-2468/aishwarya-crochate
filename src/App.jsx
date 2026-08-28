import { Routes, Route } from "react-router-dom";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import RequireAuth from "./pages/admin/RequireAuth.jsx";

function Storefront({ children }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront><Home /></Storefront>} />
      <Route path="/product/:id" element={<Storefront><ProductDetail /></Storefront>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
