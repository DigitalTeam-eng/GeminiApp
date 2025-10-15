'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { GeminiStudio } from '@/app/components/gemini-studio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Hvis loading er færdig, og der ikke er nogen bruger, omdiriger til login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mens vi tjekker auth-status, eller hvis der ikke er nogen bruger endnu, vis en loading-skærm
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Indlæser...</CardTitle>
            <CardDescription>
              Vent venligst, mens vi bekræfter din identitet.
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

  // Hvis brugeren er logget ind, vis hovedapplikationen
  return (
    <GeminiStudio
      activeConversation={null}
      onNewConversation={async () => null}
      onUpdateConversation={() => {}}
    />
  );
}
