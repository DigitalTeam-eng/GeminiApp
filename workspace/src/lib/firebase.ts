'use client';

// This file is kept for simplicity to allow other components to import getFirebaseAuth if needed,
// but the primary mechanism for auth is now the useFirebase hook from the provider.
import { initializeFirebase } from '@/firebase';

let authInstance: ReturnType<typeof initializeFirebase>['auth'] | null = null;

function getFirebaseAuth() {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!authInstance) {
        authInstance = initializeFirebase().auth;
    }
    return authInstance;
}


export { getFirebaseAuth };
