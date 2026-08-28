import { Navigate } from "react-router-dom";
import { getToken } from "../../api.js";

export default function RequireAuth({ children }) {
  if (!getToken()) return <Navigate to="/admin/login" replace />;
  return children;
}
