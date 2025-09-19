import { GeminiStudio } from '@/app/components/gemini-studio';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 font-body">
       <header className="flex w-full max-w-3xl items-center justify-center py-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Sparkles className="h-6 w-6 text-primary" />
          Gemini Studio
        </h1>
      </header>
      <main className="flex w-full flex-1 flex-col items-center">
        <GeminiStudio />
      </main>
    </div>
  );
}
