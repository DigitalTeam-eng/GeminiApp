import { GeminiStudio } from '@/app/components/gemini-studio';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 font-body">
      <header className="flex w-full max-w-3xl flex-col items-center justify-center py-8">
        <Image
          src="https://www.sn.dk/wp-content/uploads/2023/12/SN-logo-rgb.png"
          alt="Sjællandske Medier logo"
          width={400}
          height={100}
          priority
        />
        <h1 className="text-4xl font-bold mt-4">Gemini Studie</h1>
      </header>
      <main className="flex w-full flex-1 flex-col items-center">
        <GeminiStudio />
      </main>
    </div>
  );
}
