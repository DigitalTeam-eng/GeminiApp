'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User, signOut, Auth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  auth: Auth | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  auth: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // useFirebase hook er den centrale kilde til auth-state.
  const { user, isUserLoading, auth } = useFirebase(); 
  const router = useRouter();

  const logout = async () => {
    if (auth) {
        await signOut(auth);
        // Efter signOut, vil `onAuthStateChanged` i useFirebase opdage ændringen.
        // `page.tsx` vil så omdirigere til /login.
        router.push('/login'); 
    }
  };

  // Værdien fra useFirebase er allerede den "single source of truth".
  // Vi giver den blot videre.
  return (
    <AuthContext.Provider value={{ user, loading: isUserLoading, logout, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
