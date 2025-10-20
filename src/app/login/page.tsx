'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  OAuthProvider,
  signOut,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { useAuth } from '@/app/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  tid?: string;
  [key: string]: any;
}


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
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Auth-service er ikke klar. Prøv venligst igen.',
      });
      return;
    }

    const requiredTenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
    if (!requiredTenantId) {
      toast({
        variant: 'destructive',
        title: 'Konfigurationsfejl',
        description: 'Azure AD Tenant ID (NEXT_PUBLIC_AZURE_AD_TENANT_ID) er ikke konfigureret i applikationen.',
      });
      return;
    }

    setIsLoggingIn(true);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: requiredTenantId,
    });

    try {
      const result = await signInWithPopup(auth, provider);
      
      const loggedInUser = result.user;
      const userEmail = loggedInUser.email;
      const requiredDomain = '@sn.dk';

      // Robust tenant ID validation via id_token
      const credential = OAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;


      if (!idToken) {
          throw new Error("Kunne ikke verificere organisation. ID-token mangler.");
      }

      const decodedToken: DecodedToken = jwtDecode(idToken);
      const tenantId = decodedToken.tid;

      // Post-login validation
      if (!userEmail || !userEmail.endsWith(requiredDomain)) {
        throw new Error(`Login er kun tilladt for brugere med en ${requiredDomain} e-mailadresse.`);
      }
      if (tenantId !== requiredTenantId) {
        throw new Error(`Login fra en forkert organisation. Brugerens Tenant ID (${tenantId}) matcher ikke applikationens forventede Tenant ID.`);
      }

      toast({
        title: 'Login succesfuld',
        description: `Velkommen, ${loggedInUser.displayName}!`,
      });
      // Successful login will trigger the useEffect above to redirect to '/'
    } catch (error: any) {
      console.error("Popup Login Fejl:", error);

      // Log user out if validation fails after a successful popup
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      toast({
        variant: 'destructive',
        title: 'Login Fejl',
        description: error.message || 'Der opstod en ukendt fejl under login.',
        duration: 9000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show a loading screen while checking auth status or if user object exists (pre-redirect)
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Indlæser...</p>
      </div>
    );
  }

  // If not loading and no user, show the login page.
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
        <h1 className="text-3xl font-semibold tracking-tight">Gemini App</h1>
        <p className="text-sm text-muted-foreground">
          Log ind med din Microsoft-konto for at fortsætte.
        </p>
        <Button onClick={handleLogin} disabled={isLoggingIn}>
          <MicrosoftIcon className="mr-2" />
          {isLoggingIn ? 'Logger ind...' : 'Login med Microsoft'}
        </Button>
      </div>
    </div>
  );
}
