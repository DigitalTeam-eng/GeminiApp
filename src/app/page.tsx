import { GeminiStudio } from '@/app/components/gemini-studio';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 font-body">
       <header className="flex w-full max-w-3xl items-center justify-center py-8">
        <Image
          src="/logo.png"
          alt="Sjællandske Medier logo"
          width={400}
          height={100}
          priority
        />
      </header>
      <main className="flex w-full flex-1 flex-col items-center">
        <GeminiStudio />
      </main>
    </div>
  );
}
