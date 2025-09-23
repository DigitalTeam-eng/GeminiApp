// src/app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithRedirect,
  OAuthProvider,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/app/auth/auth-provider';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      prompt: 'select_account',
      tenant: 'sn.dk',
    });
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  // Håndter omdirigering efter login
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // Brugeren er logget ind
          router.push('/');
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
      });
  }, [router]);

  if (loading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Omdirigerer...</p>
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
