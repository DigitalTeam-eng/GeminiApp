
'use client';

import {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { User, signOut, Auth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';

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
  const { user, isUserLoading, auth, firebaseApp, firestore } = useFirebase(); 
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
      logout: handleSignOut, // backwards compatibility
      signOut: handleSignOut,
      auth, 
      firebaseApp, 
      firestore 
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

    

    