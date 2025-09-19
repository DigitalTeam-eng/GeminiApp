'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModelSelector } from './model-selector';
import { PromptForm } from './prompt-form';
import { ChatBubble } from './chat-bubble';
import { ImageDisplay } from './image-display';
import { generateResponse } from '@/app/actions';
import { SidebarTrigger } from '@/components/ui/sidebar';

export type ModelType = 'Pro' | 'Flash' | 'Flash-Lite' | 'Image';

export type Message = {
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  prompt?: string;
};

export function GeminiStudio() {
  const [model, setModel] = useState<ModelType>('Pro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (prompt: string, file?: File) => {
    setIsLoading(true);

    let fileDataUri: string | undefined = undefined;
    if (file) {
      if (model !== 'Image') {
        toast({
          variant: 'destructive',
          title: 'Fejl',
          description: 'Du kan kun vedhæfte billeder til Billede-modellen.',
        });
        setIsLoading(false);
        return;
      }
      fileDataUri = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const userMessage: Message = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    const result = await generateResponse({ prompt, model });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: result.error,
      });
    } else {
      let assistantMessage: Message;
      if (model === 'Image') {
        assistantMessage = {
          role: 'assistant',
          imageUrl: result.data.imageDataUri,
          prompt: prompt,
        };
      } else {
        assistantMessage = {
          role: 'assistant',
          content: result.data.response,
        };
      }
      setMessages((prev) => [...prev, assistantMessage]);
    }
    setIsLoading(false);
  };

  return (
    <div className='flex flex-col h-full'>
       <header className="flex items-center gap-4 p-4 border-b">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-bold">Gemini Studie</h1>
      </header>
      <div className='flex-1 overflow-hidden p-4 md:p-6'>
          <ScrollArea className="h-full pr-4" viewportRef={viewportRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.length === 0 && (
                 <div className="flex h-full items-center justify-center flex-col gap-4">
                    <p className="text-muted-foreground">
                        Indtast en prompt nedenfor for at starte samtalen.
                    </p>
                </div>
            )}
            {messages.map((message, index) =>
              message.imageUrl ? (
                <ImageDisplay
                  key={index}
                  src={message.imageUrl}
                  prompt={message.prompt ?? 'Genereret billede'}
                />
              ) : (
                <ChatBubble
                  key={index}
                  role={message.role}
                  content={message.content ?? ''}
                />
              )
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 md:p-6 border-t bg-background">
        <div className="max-w-3xl mx-auto">
            <ModelSelector value={model} onValueChange={(val) => setModel(val as ModelType)} />
            <div className='h-4' />
            <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
            <p className='text-xs text-muted-foreground mt-2'>
                Tryk Shift+Enter for at lave et linjeskift.
            </p>
        </div>
      </div>
    </div>
  );
}
