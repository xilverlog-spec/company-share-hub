import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if config has placeholders or is missing
const isConfigured = !!(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('YOUR_FIREBASE') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('YOUR_FIREBASE')
);

// To prevent errors during static build / missing configs,
// we initialize a fallback app configuration.
const safeConfig = isConfigured
  ? firebaseConfig
  : {
      apiKey: 'dummy-api-key',
      authDomain: 'dummy-auth-domain',
      projectId: 'company-share-hub-fallback', // alphanumeric/hyphen string
      storageBucket: 'dummy-storage-bucket',
      messagingSenderId: 'dummy-messaging-sender-id',
      appId: 'dummy-app-id',
    };

const app = getApps().length === 0 ? initializeApp(safeConfig) : getApp();
const db = getFirestore(app);

export { app, db, isConfigured };
