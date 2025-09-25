
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  OAuthProvider,
  getRedirectResult,
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
    
    const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
    if (!tenantId) {
        console.error("Azure AD Tenant ID is not configured in environment variables.");
        toast({
            variant: 'destructive',
            title: 'Konfigurationsfejl',
            description: 'Azure AD Tenant ID mangler. Kontakt venligst support.',
        });
        return;
    }

    const provider = new OAuthProvider('microsoft.com');
    // This is crucial for single-tenant applications.
    provider.setCustomParameters({
      tenant: tenantId,
    });


    try {
      const result = await signInWithPopup(auth, provider);
      toast({
        title: 'Login succesfuld',
        description: `Velkommen, ${result.user.displayName}`,
      });
      router.push('/');
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
