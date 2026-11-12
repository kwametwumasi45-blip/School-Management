
require("dotenv").config();

const {
  initializeApp,
  applicationDefault,
  getApps
} = require("firebase-admin/app");

const {
  getFirestore
} = require("firebase-admin/firestore");

// Check Firebase credentials
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error(
    "Firebase credentials path is missing. Check your .env file."
  );
}

// Initialize Firebase only once
if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault()
  });
}

// Connect to Cloud Firestore
const db = getFirestore();

// Export database connection
module.exports = db;
