
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
  onNewConversation: () => void;
  onUpdateConversation: (conversation: Conversation) => void;
}


export function GeminiStudio({ activeConversation, onNewConversation, onUpdateConversation }: GeminiStudioProps) {
  const [model, setModel] = useState<ModelType>('Pro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isTitlePending, startTitleTransition] = useTransition();

  const isNewConversation = activeConversation && activeConversation.messages.length === 0;

  useEffect(() => {
    setMessages(activeConversation?.messages ?? []);
  }, [activeConversation]);

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
    
    let currentConversation = activeConversation;

    if (!currentConversation) {
      onNewConversation();
      // We can't get the new conversation immediately, so we handle title generation in an effect.
    }

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
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Title generation is now handled by the useEffect below
    
    const result = await generateResponse({ prompt, model });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: result.error,
      });
       // Revert user message on error
       setMessages(messages);
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
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      if(activeConversation) {
        onUpdateConversation({...activeConversation, messages: finalMessages});
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isNewConversation && messages.length > 0 && activeConversation) {
      const firstPrompt = messages[0].content;
      if (firstPrompt) {
        startTitleTransition(async () => {
          try {
            const title = await generateConversationTitle({ prompt: firstPrompt });
            if (activeConversation) {
              onUpdateConversation({ ...activeConversation, title });
            }
          } catch (error) {
            console.error("Failed to generate title", error);
            // Optionally, revert to a default title or handle the error
          }
        });
      }
    }
    // We only want to run this when a new conversation is detected and the first message is added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewConversation, messages, activeConversation]);


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
