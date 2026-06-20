const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Option 1: Using service account key file
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized with service account key.');
} catch (err) {
  // Option 2: Fallback to GOOGLE_APPLICATION_CREDENTIALS env var or default credentials
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('Firebase Admin initialized with application default credentials.');
  } catch (fallbackErr) {
    console.warn(
      'WARNING: Firebase Admin could not be initialized. Auth verification will not work.',
      'Place a serviceAccountKey.json in the backend/ directory or set GOOGLE_APPLICATION_CREDENTIALS.'
    );
    // Initialize without credentials so the app can still start
    admin.initializeApp();
  }
}

module.exports = admin;
