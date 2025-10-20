'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
} from 'firebase/auth';
import { useAuth } from '@/app/auth/auth-provider';
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
  const { user, loading, auth } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  const requiredDomain = '@sn.dk';
  const requiredTenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;

  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const userEmail = result.user.email;
          const tenantId = result.user.tenantId;

          if (!requiredTenantId) {
             throw new Error('Azure AD Tenant ID (NEXT_PUBLIC_AZURE_AD_TENANT_ID) er ikke konfigureret i applikationen.');
          }
          if (!userEmail || !userEmail.endsWith(requiredDomain)) {
            throw new Error(`Login er kun tilladt for brugere med en ${requiredDomain} e-mailadresse.`);
          }
          if (tenantId !== requiredTenantId) {
            throw new Error(`Forkert organisation. Modtaget Tenant ID: ${tenantId}. Forventet Tenant ID: ${requiredTenantId}`);
          }
        }
      })
      .catch((error) => {
        console.error("Redirect Login Fejl:", error);
        toast({
            variant: 'destructive',
            title: 'Login Fejl',
            description: `Fejlkode: ${error.code}\n\nFejlbesked: ${error.message}`,
            duration: 10000,
        });
        if (auth) {
          auth.signOut();
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [auth, requiredTenantId, toast]);
  
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    if (!auth) {
      console.error("Auth service is not available.");
      toast({
        variant: 'destructive',
        title: 'Konfigurationsfejl',
        description: 'Firebase auth-tjenesten er ikke tilgængelig.',
      });
      return;
    }
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
    await signInWithRedirect(auth, provider);
  };

  if (loading || isVerifying || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Omdirigerer og bekræfter...</p>
      </div>
    );
  }

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
        <Button onClick={handleLogin} disabled={loading}>
           <MicrosoftIcon className="mr-2" />
          Login med Microsoft
        </Button>
      </div>
    </div>
  );
}
