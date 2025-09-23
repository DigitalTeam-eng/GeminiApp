// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Hardcoded Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXs4Zt7FZI7ibU1pmSuF1LT4_J9mIutJA",
  authDomain: "studio-6932359731-5d066.firebaseapp.com",
  projectId: "studio-6932359731-5d066",
  storageBucket: "studio-6932359731-5d066.appspot.com",
  messagingSenderId: "132477403200",
  appId: "1:132477403200:web:ec43e3967286b4494d5fa5",
  measurementId: ""
};


function getFirebaseApp() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!getApps().length) {
        if (!firebaseConfig.apiKey) {
            console.error("Firebase API Key is missing. Configuration is not set.");
            return null;
        }
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}

function getFirebaseAuth() {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    if (!auth) {
        auth = getAuth(app);
    }
    return auth;
}

export { getFirebaseAuth, getFirebaseApp };
