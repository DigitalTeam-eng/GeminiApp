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
import { getSuggestionsFromPrompt } from '@/ai/flows/get-suggestions-from-prompt';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const promptFormRef = useRef<{ setPrompt: (prompt: string) => void }>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const result = await getSuggestionsFromPrompt({ modelType: model });
        setSuggestions(result);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    }
    fetchSuggestions();
  }, [model]);

  const handleSuggestionClick = (suggestion: string) => {
    if (promptFormRef.current) {
        promptFormRef.current.setPrompt(suggestion);
    }
  };


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
          content: JSON.stringify(result.data, null, 2),
        };
      }
      setMessages((prev) => [...prev, assistantMessage]);
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-3xl rounded-2xl shadow-lg flex flex-col h-[80vh]">
      <CardHeader>
        <CardDescription>Vælg en model for at begynde.</CardDescription>
        <ModelSelector value={model} onValueChange={(val) => setModel(val as ModelType)} />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                 <div className="flex h-full items-center justify-center flex-col gap-4">
                    <p className="text-muted-foreground">
                        Indtast en prompt nedenfor for at starte samtalen.
                    </p>
                    <div className='flex flex-wrap gap-2 justify-center'>
                      <p className='text-sm text-muted-foreground w-full text-center'>Eller prøv et af disse forslag:</p>
                      {suggestions.map((suggestion, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </Button>
                      ))}
                    </div>
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
      </CardContent>
      <CardFooter className="pt-6 flex flex-col items-start gap-2">
        <PromptForm ref={promptFormRef} onSubmit={handleSubmit} isLoading={isLoading} />
        <p className='text-xs text-muted-foreground'>
            Tryk Shift+Enter for at lave et linjeskift.
        </p>
      </CardFooter>
    </Card>
  );
}
