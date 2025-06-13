import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Invoice1PDF from "./Invoice1PDF";
import { PDFViewer } from "@react-pdf/renderer";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Invoice1PDFWrapper = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      const docRef = doc(db, "invoices", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInvoice(docSnap.data());
      }
    };
    fetchInvoice();
  }, [id]);

  if (!invoice) return <div>Chargement...</div>;

  return (
    <PDFViewer width="100%" height="1000">
      <Invoice1PDF invoice={invoice} />
    </PDFViewer>
  );
};

export default Invoice1PDFWrapper;