import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { logger } from '../utils/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Analytics is optional - only include if configured
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && {
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  }),
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId;

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics only in production and if supported
    // Note: Analytics requires user consent in production (GDPR compliance)
    if (import.meta.env.PROD && firebaseConfig.measurementId) {
      isAnalyticsSupported()
        .then((supported) => {
          if (supported) {
            try {
              analytics = getAnalytics(app!);
              logger.log('Firebase Analytics initialized');
            } catch (error) {
              logger.warn('Failed to initialize Firebase Analytics:', error);
            }
          } else {
            logger.log('Firebase Analytics not supported in this environment');
          }
        })
        .catch((error) => {
          logger.warn('Error checking Analytics support:', error);
        });
    }
    
    logger.log('Firebase initialized successfully');
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    logger.warn('App will run in offline mode without authentication');
  }
} else {
  logger.warn('Firebase not configured. Create a .env file with your Firebase credentials.');
  logger.warn('Copy .env.example to .env and fill in your Firebase project details.');
  logger.warn('App will run in offline mode without authentication.');
}

export { auth, db, analytics, isFirebaseConfigured };
