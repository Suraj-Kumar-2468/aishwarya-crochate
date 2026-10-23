import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SiteDataProvider } from "./context/SiteDataContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { CustomerProvider } from "./context/CustomerContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteDataProvider>
        <CustomerProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CustomerProvider>
      </SiteDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
