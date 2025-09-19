
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
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
import { generateConversationTitle } from '@/app/actions';

export type ModelType = 'Pro' | 'Flash' | 'Flash-Lite' | 'Image';

export type Message = {
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  prompt?: string;
};

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface GeminiStudioProps {
  activeConversation: Conversation | null;
  onNewConversation: () => string; // Returns new conversation ID
  onUpdateConversation: (conversation: Conversation) => void;
}


export function GeminiStudio({ activeConversation, onNewConversation, onUpdateConversation }: GeminiStudioProps) {
  const [model, setModel] = useState<ModelType>('Pro');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const messages = activeConversation?.messages ?? [];

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

    let currentConvId = activeConversation?.id;
    const isNewConv = !currentConvId || (activeConversation && activeConversation.messages.length === 0);

    // 1. Create new conversation if needed
    if (isNewConv) {
      currentConvId = onNewConversation();
    }
    
    if (!currentConvId) {
        toast({ variant: 'destructive', title: 'Fejl', description: 'Kunne ikke oprette eller finde samtale.' });
        setIsLoading(false);
        return;
    }

    const userMessage: Message = { role: 'user', content: prompt };
    const newMessages: Message[] = [...messages, userMessage];

    // Optimistically update UI with user message
    if (activeConversation) {
        onUpdateConversation({ ...activeConversation, id: currentConvId, messages: newMessages });
    } else {
         onUpdateConversation({ id: currentConvId, title: 'Ny Samtale', messages: newMessages });
    }
    
    try {
        // 2. Generate response from AI
        const result = await generateResponse({ prompt, model });

        if (result.error) {
            throw new Error(result.error);
        }

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

        const finalMessages = [...newMessages, assistantMessage];
        
        // 3. Generate title if it's a new conversation
        if (isNewConv) {
            const title = await generateConversationTitle({ prompt });
            onUpdateConversation({ id: currentConvId, title, messages: finalMessages });
        } else if (activeConversation) {
            onUpdateConversation({ ...activeConversation, messages: finalMessages });
        }

    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Fejl',
            description: e.message || 'Der opstod en uventet fejl.',
        });
        // Revert user message on error
        if (activeConversation) {
             onUpdateConversation({ ...activeConversation, messages: messages });
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col h-full'>
       <header className="flex items-center gap-4 p-4 border-b shrink-0">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-bold">Gemini Studie</h1>
      </header>
      <div className='flex-1 overflow-y-auto'>
          <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="space-y-4 max-w-3xl mx-auto p-4 md:p-6">
            {messages.length === 0 && (
                 <div className="flex items-center justify-center h-full">
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
             {isLoading && (
              <ChatBubble role="assistant" content="Tænker..." />
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 md:p-6 border-t bg-background shrink-0">
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
