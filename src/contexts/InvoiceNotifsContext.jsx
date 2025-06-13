import React, { createContext, useContext, useState } from "react";

const InvoiceNotifsContext = createContext();

export function InvoiceNotifsProvider({ children }) {
  const [invoiceNotifs, setInvoiceNotifs] = useState([]);
  return (
    <InvoiceNotifsContext.Provider value={{ invoiceNotifs, setInvoiceNotifs }}>
      {children}
    </InvoiceNotifsContext.Provider>
  );
}

export function useInvoiceNotifs() {
  return useContext(InvoiceNotifsContext);
}