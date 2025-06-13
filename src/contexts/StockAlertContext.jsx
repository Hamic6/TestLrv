import React, { createContext, useContext, useState } from "react";

const StockAlertContext = createContext();

export function StockAlertProvider({ children }) {
  const [stockAlertCount, setStockAlertCount] = useState(0);
  const [stockAlertArticles, setStockAlertArticles] = useState([]);

  return (
    <StockAlertContext.Provider value={{ stockAlertCount, setStockAlertCount, stockAlertArticles, setStockAlertArticles }}>
      {children}
    </StockAlertContext.Provider>
  );
}

export function useStockAlert() {
  return useContext(StockAlertContext);
}