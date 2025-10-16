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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  auth: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading, auth } = useFirebase(); 
  const router = useRouter();

  const logout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/login'); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: isUserLoading, logout, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
