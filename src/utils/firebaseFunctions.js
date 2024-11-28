// firebaseFunctions.js
import { db } from '../firebaseConfig'; // Chemin ajusté selon ton arborescence
import { collection, addDoc, getDocs } from 'firebase/firestore';

const saveInvoiceToFirebase = async (invoiceData) => {
  try {
    const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

const getInvoicesFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'invoices'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    console.error('Error fetching documents: ', e);
    return [];
  }
};

export { saveInvoiceToFirebase, getInvoicesFromFirebase };
