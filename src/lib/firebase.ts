// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseApp() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!getApps().length) {
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        // Check if all keys are present
        if (!firebaseConfig.apiKey) {
            console.error("Firebase API Key is missing. Check your environment variables.");
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
