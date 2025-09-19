
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
import { generateConversationTitle } from '@/app/actions';
import { UserImageDisplay } from './user-image-display';

export type ModelType = 'Pro' | 'Flash' | 'Flash-Lite' | 'Image';

export type Message = {
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  prompt?: string;
  baseImageUrl?: string;
};

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface GeminiStudioProps {
  activeConversation: Conversation | null;
  onNewConversation: () => Promise<string>;
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

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (prompt: string, file?: File) => {
    setIsLoading(true);

    let currentConvId = activeConversation?.id;
    const isNewConv = !activeConversation || activeConversation.messages.length === 0;

    // Use a function to update conversation to avoid stale state issues
    const updateCurrentConversation = (updater: (conv: Conversation) => Conversation) => {
        onUpdateConversation(updater(conversations.find(c => c.id === currentConvId)!));
    };

    try {
        let fileDataUri: string | undefined = undefined;
        if (file) {
            fileDataUri = await fileToDataUri(file);
        }
        
        const userMessage: Message = { 
            role: 'user', 
            content: prompt,
            baseImageUrl: fileDataUri 
        };

        // 1. Create new conversation if needed
        if (isNewConv) {
            currentConvId = await onNewConversation();
            const title = await generateConversationTitle({ prompt });
            
            // This is the first update with title and the first message
            onUpdateConversation({ id: currentConvId, title, messages: [userMessage] });

        } else if (currentConvId) {
            // Add user message to existing conversation
             updateCurrentConversation(conv => ({
                ...conv,
                messages: [...conv.messages, userMessage]
            }));
        } else {
            throw new Error('Kunne ikke finde den aktive samtale.');
        }

        // 2. Generate response from AI
        const result = await generateResponse({ prompt, model, fileDataUri });

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
        
        // 3. Add assistant message to the conversation
        updateCurrentConversation(conv => ({
            ...conv,
            messages: [...conv.messages, assistantMessage]
        }));


    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Fejl',
            description: e.message || 'Der opstod en uventet fejl.',
        });
        // Optionally revert user message on error, though it might be better to show it failed
        if (currentConvId) {
             updateCurrentConversation(conv => ({
                ...conv,
                messages: conv.messages.slice(0, -1) // remove optimistic user message
            }));
        }
    } finally {
        setIsLoading(false);
    }
  };

  const conversations = activeConversation ? [activeConversation] : [];

  return (
    <div className='flex flex-col h-full bg-background'>
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
            {messages.map((message, index) => {
              if (message.role === 'user') {
                return message.baseImageUrl ? (
                    <UserImageDisplay 
                        key={index}
                        src={message.baseImageUrl}
                        prompt={message.content ?? ''}
                    />
                ) : (
                    <ChatBubble
                        key={index}
                        role={message.role}
                        content={message.content ?? ''}
                    />
                );
              }

              // Assistant message
              return message.imageUrl ? (
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
              );
            })}
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
