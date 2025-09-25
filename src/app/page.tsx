
'use client';

import { GeminiStudio, Conversation, Message } from '@/app/components/gemini-studio';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarMenuAction,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MoreHorizontal, Plus, Trash2, LogOut } from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { generateConversationTitle } from '@/app/actions';
import { useAuth } from '@/app/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const initialConversations: Conversation[] = [
    { id: '1', title: 'Labrador i solnedgang', messages: [{role: 'user', content: 'Tegn en labrador i en solnedgang'}] },
    { id: '2', title: 'Tidligere samtale 2', messages: [{role: 'user', content: 'Hej med dig!'}] },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );
  
  const handleNewConversation = useCallback(async (prompt: string, initialMessage?: Message): Promise<Conversation | null> => {
    if (!prompt.trim()) return null;

    try {
        const newTitle = await generateConversationTitle({ prompt });
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
        return null;
    }
  }, []);

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

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Indlæser...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex">
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                 <Image
                    src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
                    alt="Sjællandske Medier logo"
                    width={150}
                    height={37}
                    priority
                />
                <SidebarTrigger className="ml-auto" />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col">
            <Button variant="outline" className='w-full justify-start' onClick={() => setActiveConversationId(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Ny samtale
            </Button>
            <div className='flex-1 mt-4 overflow-y-auto'>
                <p className='text-sm text-muted-foreground px-2'>Historik</p>
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
                                    {conv.title}
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
        <SidebarFooter className="p-2">
            <div className="flex items-center gap-3 p-2 rounded-md bg-card">
                 <Avatar className="h-9 w-9">
                     {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Bruger'} />}
                     <AvatarFallback>{user.displayName?.charAt(0) || 'B'}</AvatarFallback>
                </Avatar>
                <div className='flex-1 overflow-hidden'>
                    <p className='text-sm font-semibold truncate'>{user.displayName}</p>
                    <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-col flex-1">
        <GeminiStudio 
            activeConversation={activeConversation} 
            onNewConversation={handleNewConversation}
            onUpdateConversation={handleUpdateConversation} 
        />
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
  );
}
