'use client';

import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { User, signOut, Auth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase/provider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  auth: Auth | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  auth: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/login'); 
    }
  };

  const value = { 
      user, 
      loading: isUserLoading, 
      logout: handleSignOut,
      signOut: handleSignOut,
      auth, 
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);