import admin from 'firebase-admin';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  "type": process.env.GOOGLE_TYPE,
  "project_id": process.env.GOOGLE_PROJECT_ID,
  "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
  "private_key": process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.GOOGLE_CLIENT_EMAIL,
  "client_id": process.env.GOOGLE_CLIENT_ID,
  "auth_uri": process.env.GOOGLE_AUTH_URI,
  "token_uri": process.env.GOOGLE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  "client_x509_cert_url": process.env.GOOGLE_CLIENT_CERT_URL
};

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
