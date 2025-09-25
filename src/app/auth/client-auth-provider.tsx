'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User, signOut, getRedirectResult } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
        console.error("Firebase Auth is not available. Check your configuration.");
        setLoading(false);
        return;
    }
    
    // First, check for redirect result. This is crucial for the redirect flow.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User successfully signed in.
          // onAuthStateChanged will handle setting the user.
        }
      })
      .catch((error) => {
        console.error("Error during getRedirectResult:", error);
        toast({
          variant: 'destructive',
          title: 'Login Fejl',
          description: 'Kunne ikke verificere login efter omdirigering.',
        });
      })
      .finally(() => {
         // Now, set up the persistent state listener.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
      });

  }, []);

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
        await signOut(auth);
        toast({
            title: 'Logget ud',
            description: 'Du er nu logget ud.',
        });
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
