'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  Auth,
} from 'firebase/auth';
import { useFirebase } from '@/firebase'; // Importerer den primære hook
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image';

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    {...props}
  >
    <path fill="#f25022" d="M11.5 21.5h-9v-9h9z" />
    <path fill="#00a4ef" d="M11.5 11.5h-9v-9h9z" />
    <path fill="#7fba00" d="M21.5 21.5h-9v-9h9z" />
    <path fill="#ffb900" d="M21.5 11.5h-9v-9h9z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading, auth } = useFirebase(); // Bruger den centrale hook
  const { toast } = useToast();

  // Omdiriger til hovedsiden hvis brugeren er logget ind
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Auth-service er ikke klar. Prøv venligst igen om et øjeblik.',
      });
      return;
    }
    
    const requiredTenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
    if (!requiredTenantId) {
       toast({
        variant: 'destructive',
        title: 'Konfigurationsfejl',
        description: 'Azure AD Tenant ID er ikke konfigureret korrekt i applikationen. NEXT_PUBLIC_AZURE_AD_TENANT_ID mangler.',
      });
      return;
    }

    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: requiredTenantId,
    });
    // Her starter redirect flowet. Vi håndterer ikke resultatet her, det gør AuthProvider.
    await signInWithRedirect(auth, provider);
  };

  // Viser en loading-skærm mens vi venter på at vide om brugeren er logget ind eller ej
  if (isUserLoading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Bekræfter login-status...</p>
      </div>
    );
  }

  // Hvis vi ikke loader og der ikke er nogen bruger, vis login-siden.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
       <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center gap-6 text-center">
         <NextImage
                src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
                alt="Sjællandske Medier logo"
                width={200}
                height={50}
                priority
                className="mx-auto"
            />
          <h1 className="text-3xl font-semibold tracking-tight">Gemini Studie</h1>
          <p className="text-sm text-muted-foreground">
            Log ind med din Microsoft-konto for at fortsætte.
          </p>
        <Button onClick={handleLogin} disabled={isUserLoading || !auth}>
           <MicrosoftIcon className="mr-2" />
          Login med Microsoft
        </Button>
      </div>
    </div>
  );
}
