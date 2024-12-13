// utils/api.js
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Fonction pour sauvegarder l'avis de passage dans la base de données
export const saveAvisToDatabase = async (avis) => {
  try {
    const docRef = await addDoc(collection(db, 'avisDePassage'), avis);
    console.log('Avis de passage sauvegardé avec ID: ', docRef.id);
  } catch (e) {
    console.error('Erreur lors de la sauvegarde de l\'avis de passage: ', e);
  }
};
