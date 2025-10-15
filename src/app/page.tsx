
'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import {
  signInWithPopup,
  OAuthProvider,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { GeminiStudio } from '@/app/components/gemini-studio';
import NextImage from 'next/image';

// Define a simple Microsoft icon component
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

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const requiredDomain = '@sn.dk';
  // IMPORTANT: This variable is read on the client, so it MUST start with NEXT_PUBLIC_
  const requiredTenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
  
  // isUserLoading handles the initial auth state check from onAuthStateChanged
  // No need for a separate isVerifying state
  
  const loginWithMicrosoft = async () => {
    if (!requiredTenantId) {
      toast({
        variant: 'destructive',
        title: 'Konfigurationsfejl',
        description:
          'Azure AD Tenant ID er ikke konfigureret korrekt i applikationen. NEXT_PUBLIC_AZURE_AD_TENANT_ID mangler.',
      });
      console.error('NEXT_PUBLIC_AZURE_AD_TENANT_ID is not set.');
      return;
    }
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: requiredTenantId,
    });
    
    try {
        const result = await signInWithPopup(auth, provider);
        // Successful login is handled by the onAuthStateChanged listener,
        // but we can do immediate validation here as well for better error feedback.
        const userEmail = result.user.email;
        const tenantId = result.user.tenantId;

        if (!userEmail || !userEmail.endsWith(requiredDomain)) {
          throw new Error(`Login er kun tilladt for brugere med en ${requiredDomain} e-mailadresse.`);
        }
        if (tenantId !== requiredTenantId) {
          throw new Error(`Forkert organisation. Modtaget Tenant ID: ${tenantId}. Forventet Tenant ID: ${requiredTenantId}`);
        }
        // If validation passes, the `onAuthStateChanged` listener in useUser hook
        // will set the user state and the component will re-render, showing GeminiStudio.

    } catch (error: any) {
        console.error("Popup Login Fejl:", error);
        toast({
            variant: 'destructive',
            title: 'Login Fejl',
            description: `Fejlkode: ${error.code}\n\nFejlbesked: ${error.message}`,
            duration: 10000, // Vis toast i 10 sekunder
        });
        // Ensure user is signed out in case of a partial or failed login attempt
        auth.signOut();
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Bekræfter login...</CardTitle>
            <CardDescription>
              Vent venligst, mens vi tjekker dine oplysninger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Card className="w-[350px]">
          <CardHeader className="items-center text-center">
            <NextImage
                src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
                alt="Sjællandske Medier logo"
                width={200}
                height={50}
                priority
            />
            <CardTitle className="pt-4">Gemini Studie</CardTitle>
            <CardDescription>
              Log ind for at fortsætte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={loginWithMicrosoft}
            >
              <MicrosoftIcon className="mr-2" />
              Log ind med Microsoft
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in and verified
  return (
    <GeminiStudio
        activeConversation={null}
        onNewConversation={async () => null}
        onUpdateConversation={() => {}}
    />
  );
}
