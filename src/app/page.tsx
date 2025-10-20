
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
    // If loading is finished and there is no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While we check auth status, or if there is no user yet, show a loading screen
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Indlæser Applikation...</CardTitle>
            <CardDescription>
              Vent venligst...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the user is logged in, show the main application
  return (
    <GeminiStudio />
  );
}

    