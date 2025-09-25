
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  OAuthProvider,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/app/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleLogin = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
        console.error("Auth service is not available.");
         toast({
          variant: 'destructive',
          title: 'Fejl',
          description: 'Firebase er ikke konfigureret korrekt. Tjek dine miljøvariabler.',
        });
        return;
    }
    const provider = new OAuthProvider('microsoft.com');
    // Important for multi-tenant applications to target a specific organization
    provider.setCustomParameters({
      tenant: 'sn.dk',
    });

    try {
      const result = await signInWithPopup(auth, provider);
      // User is signed in.
      if (result.user) {
        router.push('/');
      } else {
        throw new Error("Login lykkedes, men ingen bruger blev fundet.");
      }
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      toast({
          variant: 'destructive',
          title: 'Login Fejl',
          description: error.message || 'Der opstod en fejl under login.',
      });
    }
  };

  if (loading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Indlæser...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Log ind med din Microsoft-konto for at fortsætte.
          </p>
        </div>
        <Button onClick={handleLogin} disabled={loading}>
          Login med Microsoft
        </Button>
      </div>
    </div>
  );
}
