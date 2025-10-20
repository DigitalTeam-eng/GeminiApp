'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    
    // This logic ensures the correct authDomain is used for both local dev and deployment.
    // It's critical for non-Firebase hosting environments like Azure.
    const getAuthDomain = () => {
        if (typeof window !== 'undefined') {
            // Using window.location.host is the most robust way to get the correct
            // hostname and port, regardless of the environment (localhost, cloud workstation, or deployed).
            return window.location.host;
        }
        // Fallback for server-side rendering, though auth is client-side.
        // This value is less critical as client-side will always take precedence.
        return process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:9002';
    };

    const firebaseConfig = {
      "apiKey": "AIzaSyBXs4Zt7FZI7ibU1pmSuF1LT4_J9mIutJA",
      "authDomain": getAuthDomain(),
      "projectId": "studio-6932359731-5d066"
    };
    
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';