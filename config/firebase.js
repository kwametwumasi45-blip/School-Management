
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
  initializeApp,
  cert,
  getApps
} = require("firebase-admin/app");

const { getFirestore } = require("firebase-admin/firestore");

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error("Firebase credentials path is missing. Check your .env file.");
}

if (!fs.existsSync(credentialsPath)) {
  throw new Error("Firebase service-account file was not found.");
}

const serviceAccount = JSON.parse(
  fs.readFileSync(credentialsPath, "utf8")
);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = getFirestore();

module.exports = db;
