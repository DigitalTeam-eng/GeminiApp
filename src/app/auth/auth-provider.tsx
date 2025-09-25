
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User, signOut, Auth, getRedirectResult } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
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
        // We are in an unconfigured state, maybe redirect to an error page or show a message.
        // For now, we just stop loading and the protected routes will redirect to login.
        return;
    }

    // This handles the redirect result on initial load
    getRedirectResult(auth)
      .catch((error) => {
        // Handle errors here.
        console.error("Error from getRedirectResult:", error);
        toast({
            variant: 'destructive',
            title: 'Login Fejl',
            description: error.message || 'Der opstod en fejl under login-omdirigering.',
        });
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
        await signOut(auth);
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
