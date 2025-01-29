const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
  return new Promise((resolve, reject) => {
    cors(context.rawRequest, context.rawResponse, async () => {
      if (!context.auth) {
        reject(
          new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
          )
        );
        return;
      }

      const { email, password, displayName } = data;

      try {
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName,
        });

        await admin.firestore().collection("users").doc(userRecord.uid).set({
          email,
          displayName,
          roles: [],
        });

        resolve({ uid: userRecord.uid });
      } catch (error) {
        reject(new functions.https.HttpsError("unknown", error.message, error));
      }
    });
  });
});
