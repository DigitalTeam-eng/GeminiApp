'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Explicitly initializing with the correct config, especially authDomain,
    // is critical for non-Firebase hosting environments like Azure.
    const firebaseApp = initializeApp({
      "apiKey": "AIzaSyBXs4Zt7FZI7ibU1pmSuF1LT4_J9mIutJA",
      "authDomain": "geminiapp-dxaah3g6cnhadthr.northeurope-01.azurewebsites.net",
      "projectId": "studio-6932359731-5d066",
    });
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
