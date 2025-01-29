const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createUser = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      logger.error("Method not allowed");
      return res.status(405).send("Method Not Allowed");
    }

    const { email, password, displayName } = req.body;

    try {
      logger.info("Creating user with email:", email);

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

      logger.info("User created successfully with UID:", userRecord.uid);
      res.status(200).send({ uid: userRecord.uid });
    } catch (error) {
      logger.error("Error creating user:", error);
      res.status(500).send({ error: error.message });
    }
  });
});
