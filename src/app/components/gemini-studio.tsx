
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { PromptForm } from './prompt-form';
import { ChatBubble } from './chat-bubble';
import { ImageDisplay } from './image-display';
import { generateResponse, generateConversationTitle } from '@/app/actions';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserImageDisplay } from './user-image-display';
import type { HistoryMessage } from '@/ai/flows/generate-text-from-prompt';


export type Message = {
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  prompt?: string;
  baseImageUrls?: string[];
};

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface GeminiStudioProps {
  activeConversation: Conversation | null;
  onNewConversation: (prompt: string, initialMessage: Message) => Promise<Conversation | null>;
  onUpdateConversation: (conversation: Conversation) => void;
}


export function GeminiStudio({ activeConversation, onNewConversation, onUpdateConversation }: GeminiStudioProps) {
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
  }, [activeConversation?.messages]);

  const filesToDataUris = (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });
    return Promise.all(promises);
  };

  const handleSubmit = async (prompt: string, files: File[] = []) => {
    setIsLoading(true);

    let currentConv = activeConversation;

    try {
        let filesDataUris: string[] | undefined = undefined;
        if (files.length > 0) {
            filesDataUris = await filesToDataUris(files);
        }

        const userMessage: Message = {
            role: 'user',
            content: prompt,
            baseImageUrls: filesDataUris,
        };

        // Handle new conversation creation
        if (!currentConv) {
            const newConv = await onNewConversation(prompt || `Billede: ${files[0]?.name || '...'}`, userMessage);
            if (!newConv) {
                throw new Error("Samtale kunne ikke oprettes.");
            }
            currentConv = newConv; // Use the newly created conversation
        } else {
             const conversationWithUserMessage = {
                ...currentConv,
                messages: [...currentConv.messages, userMessage]
            };
            onUpdateConversation(conversationWithUserMessage);
            currentConv = conversationWithUserMessage;
        }

        const baseImageDataUris: string[] = filesDataUris || [];

        // Prepare history for the AI model
        const history: HistoryMessage[] = currentConv.messages
          .slice(0, -1) // Exclude the current user message
          .map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            content: msg.content ?? '',
          }));
        
        const result = await generateResponse({ prompt: prompt || '', baseImageDataUris: baseImageDataUris, history });

        if (result.error) {
            throw new Error(result.error);
        }

        let assistantMessage: Message;
        if (result.data.type === 'image') {
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
        
        const finalConversation = {
            ...currentConv,
            messages: [...currentConv.messages, assistantMessage]
        };
        onUpdateConversation(finalConversation);

    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Fejl',
            description: e.message || 'Der opstod en uventet fejl.',
        });
    } finally {
        setIsLoading(false);
    }
};


  return (
    <div className='flex flex-col h-full bg-card'>
       <header className="flex items-center gap-4 p-4 border-b shrink-0">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-bold">Gemini Studie</h1>
      </header>
      <div className='flex-1 overflow-y-auto'>
          <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div className="space-y-4 max-w-3xl mx-auto p-4 md:p-6">
            {(activeConversation?.messages ?? []).length === 0 && (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                        Indtast en prompt nedenfor for at starte samtalen.
                    </p>
                </div>
            )}
            {(activeConversation?.messages ?? []).map((message, index) => {
              if (message.role === 'user') {
                return (message.baseImageUrls && message.baseImageUrls.length > 0) ? (
                    <UserImageDisplay 
                        key={index}
                        srcs={message.baseImageUrls}
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
            <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
            <p className='text-xs text-muted-foreground mt-2'>
                Tryk Shift+Enter for at lave et linjeskift.
            </p>
        </div>
      </div>
    </div>
  );
}
