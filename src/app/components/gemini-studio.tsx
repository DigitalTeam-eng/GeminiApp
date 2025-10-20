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
import { VideoDisplay } from './video-display'; 
import { generateResponse, generateConversationTitle } from '@/app/actions';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserImageDisplay } from './user-image-display';
import type { HistoryMessage } from '@/ai/flows/generate-text-from-prompt';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MoreHorizontal, Plus, Trash2, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';


export type Message = {
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  prompt?: string;
  baseImageUrls?: string[];
  model?: string;
};

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface GeminiStudioProps {
}


export function GeminiStudio({ }: GeminiStudioProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const firebaseAuth = useFirebaseAuth();
  
  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null;

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeConversation?.messages]);

   const handleNewConversation = useCallback(async (prompt: string, initialMessage?: Message): Promise<Conversation | null> => {
    if (!prompt.trim() && (!initialMessage?.baseImageUrls || initialMessage.baseImageUrls.length === 0)) return null;

    try {
        const titleText = prompt || `Billede-prompt ${new Date().toLocaleTimeString()}`;
        const newTitle = await generateConversationTitle({ prompt: titleText });
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: newTitle,
            messages: initialMessage ? [initialMessage] : [],
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        
        return newConversation;
    } catch (error) {
        console.error("Failed to create new conversation:", error);
        toast({ variant: "destructive", title: "Fejl", description: "Kunne ikke generere en titel til samtalen."});
        return null;
    }
  }, [toast]);

  const handleUpdateConversation = (updatedConversation: Conversation) => {
    setConversations(prev => {
        const exists = prev.some(c => c.id === updatedConversation.id);
        if (exists) {
            return prev.map(c => c.id === updatedConversation.id ? updatedConversation : c);
        }
        return [updatedConversation, ...prev];
    });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };
  
  const handleStartNewConversation = () => {
    setActiveConversationId(null);
  };

  const startRename = (conversation: Conversation) => {
    setRenamingConversationId(conversation.id);
    setNewTitle(conversation.title);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingConversationId && newTitle.trim()) {
        setConversations(conversations.map(c => 
            c.id === renamingConversationId ? {...c, title: newTitle.trim()} : c
        ));
        setRenamingConversationId(null);
        setNewTitle('');
    }
  };

  const handleDelete = () => {
    if (deletingConversationId) {
        setConversations(conversations.filter(c => c.id !== deletingConversationId));
        if (activeConversationId === deletingConversationId) {
            setActiveConversationId(null);
        }
        setDeletingConversationId(null);
    }
  };


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

        if (!currentConv) {
            const newConv = await handleNewConversation(prompt || `Billede: ${files[0]?.name || '...'}`, userMessage);
            if (!newConv) {
                toast({
                    variant: 'destructive',
                    title: 'Fejl',
                    description: "Samtale kunne ikke oprettes.",
                });
                setIsLoading(false);
                return;
            }
            currentConv = newConv; 
        } else {
             const conversationWithUserMessage = {
                ...currentConv,
                messages: [...currentConv.messages, userMessage]
            };
            handleUpdateConversation(conversationWithUserMessage);
            currentConv = conversationWithUserMessage;
        }
        
        let baseImageDataUris: string[] = filesDataUris || [];
        
        // If there are no new files, check previous messages for context
        if (baseImageDataUris.length === 0 && currentConv.messages.length > 1) {
            // Start from the message before the current user's message
            for (let i = currentConv.messages.length - 2; i >= 0; i--) {
                const msg = currentConv.messages[i];
                
                // If it's a video, find the original image that created it
                if (msg.role === 'assistant' && msg.videoUrl) {
                    // Search backwards from the video message to find the image it was based on
                    for (let j = i - 1; j >= 0; j--) {
                        const prevMsg = currentConv.messages[j];
                        if (prevMsg.role === 'assistant' && prevMsg.imageUrl) {
                            baseImageDataUris.push(prevMsg.imageUrl);
                            // Break inner loop once image is found
                            break;
                        }
                         if (prevMsg.role === 'user' && prevMsg.baseImageUrls && prevMsg.baseImageUrls.length > 0) {
                             baseImageDataUris.push(...prevMsg.baseImageUrls);
                             break;
                         }
                    }
                    // Break outer loop since we've found the context for the video
                    break;
                }

                // If it's an assistant message with an image, add it
                if (msg.role === 'assistant' && msg.imageUrl) {
                    baseImageDataUris.push(msg.imageUrl);
                }
                // If it's a user message with an image, add it
                if (msg.role === 'user' && msg.baseImageUrls) {
                    baseImageDataUris.push(...msg.baseImageUrls);
                }
                // Stop searching if we hit a message without media, as context is broken
                if (!msg.imageUrl && !msg.videoUrl && !msg.baseImageUrls) {
                    break;
                }
            }
        }


        const history: HistoryMessage[] = currentConv.messages
          .slice(0, -1)
          .map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            content: msg.content ?? '',
          }));
        
        const result = await generateResponse({ prompt: prompt || '', baseImageDataUris: [...new Set(baseImageDataUris)], history });

        if (result.error) {
            throw new Error(result.error);
        }

        let assistantMessage: Message;
        if (result.data.type === 'image') {
            assistantMessage = {
                role: 'assistant',
                imageUrl: result.data.imageDataUri,
                prompt: prompt,
                model: result.data.model,
            };
        } else if (result.data.type === 'video') {
            assistantMessage = {
                role: 'assistant',
                videoUrl: result.data.videoDataUri,
                prompt: prompt,
                model: result.data.model,
            };
        } else {
            assistantMessage = {
                role: 'assistant',
                content: result.data.response,
                model: result.data.model,
            };
        }
        
        const finalConversation = {
            ...currentConv,
            messages: [...currentConv.messages, assistantMessage]
        };
        handleUpdateConversation(finalConversation);

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
    <SidebarProvider>
      <div className="h-screen w-full flex">
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                 <Image
                    src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
                    alt="Sjællandske Medier logo"
                    width={150}
                    height={37}
                    priority
                    className="group-data-[collapsible=icon]:hidden"
                />
                <SidebarTrigger className="ml-auto" />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col">
            <Button variant="outline" className='w-full justify-start' onClick={handleStartNewConversation}>
                <Plus className="mr-2 h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Ny samtale</span>
            </Button>
            <div className='flex-1 mt-4 overflow-y-auto'>
                <p className='text-sm text-muted-foreground px-2 group-data-[collapsible=icon]:hidden'>Historik</p>
                <SidebarMenu>
                    {conversations.map(conv => (
                        <SidebarMenuItem key={conv.id}>
                            {renamingConversationId === conv.id ? (
                                <form onSubmit={handleRename} className="p-2">
                                    <Input 
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onBlur={() => setRenamingConversationId(null)}
                                        autoFocus
                                        className="h-8"
                                    />
                                </form>
                            ) : (
                                <SidebarMenuButton 
                                    tooltip={conv.title} 
                                    isActive={conv.id === activeConversationId}
                                    onClick={() => handleSelectConversation(conv.id)}
                                >
                                    <span className="group-data-[collapsible=icon]:hidden">{conv.title}</span>
                                </SidebarMenuButton>
                            )}
                             <SidebarMenuAction showOnHover>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => startRename(conv)}>
                                            Omdøb
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setDeletingConversationId(conv.id)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Slet
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </div>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
              <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL ?? undefined} />
                      <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-medium truncate">{user?.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  {firebaseAuth.auth && (
                    <Button variant="ghost" size="icon" onClick={() => firebaseAuth.auth && signOut(firebaseAuth.auth)} className="group-data-[collapsible=icon]:ml-auto">
                        <LogOut className="h-4 w-4" />
                    </Button>
                  )}
              </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-col flex-1">
         <div className='flex flex-col h-full bg-card'>
         <header className="flex items-center gap-4 p-4 border-b shrink-0">
          <h1 className="text-xl font-bold">Gemini Studie</h1>
        </header>
        <div className='flex-1 overflow-y-auto'>
            <ScrollArea className="h-full" viewportRef={viewportRef}>
            <div className="space-y-4 max-w-3xl mx-auto p-4 md:p-6">
              {(activeConversation?.messages ?? []).length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-center">
                      <Image 
                        src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
                        alt="Sjællandske Medier logo"
                        width={200}
                        height={50}
                        priority
                        className='mb-4'
                      />
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
                if (message.imageUrl) {
                  return (
                    <ImageDisplay
                      key={index}
                      src={message.imageUrl}
                      prompt={message.prompt ?? 'Genereret billede'}
                      model={message.model}
                    />
                  );
                }
                
                if (message.videoUrl) {
                  return (
                    <VideoDisplay
                      key={index}
                      src={message.videoUrl}
                      prompt={message.prompt ?? 'Genereret video'}
                      model={message.model}
                    />
                  );
                }

                return (
                  <ChatBubble
                    key={index}
                    role={message.role}
                    content={message.content ?? ''}
                    model={message.model}
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
      </main>

      <AlertDialog open={!!deletingConversationId} onOpenChange={(open) => !open && setDeletingConversationId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                    Denne handling kan ikke fortrydes. Dette vil permanent slette din samtale.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuller</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Slet</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </SidebarProvider>
  );
}
