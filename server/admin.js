import admin from 'firebase-admin';
import express from 'express';
import serviceAccount from './serviceAccountKey.json' assert { type: "json" };

// Initialiser l'Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();

// Route pour synchroniser les utilisateurs avec Firestore
app.get('/sync-users', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers();
    listUsersResult.users.forEach(async (userRecord) => {
      const user = userRecord.toJSON();
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || ''
      }, { merge: true });
    });
    res.status(200).send('Users synchronized');
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).send('Error listing users');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { db, auth };
