import { GeminiStudio } from '@/app/components/gemini-studio';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 font-body">
      <header className="flex w-full max-w-3xl flex-col items-center justify-center py-8">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
          alt="Sjællandske Medier logo"
          width={250}
          height={62}
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
