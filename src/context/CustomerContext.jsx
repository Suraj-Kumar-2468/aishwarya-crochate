import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchCustomer, getCustomerToken, clearCustomerToken } from "../api.js";

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(!!getCustomerToken());

  useEffect(() => {
    if (!getCustomerToken()) return;
    fetchCustomer()
      .then(setCustomer)
      .catch(() => clearCustomerToken())
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    clearCustomerToken();
    setCustomer(null);
  }, []);

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, logout, loading }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);
