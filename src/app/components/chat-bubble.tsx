'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemini-svar.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-4 animate-in fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
        {!isUser && (
            <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
            </Avatar>
        )}
      <div
        className={cn(
          'relative max-w-[80%] rounded-2xl p-4',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card'
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{content}</p>
        {isAssistant && (
           <Button
              onClick={handleDownload}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Download svar"
            >
              <Download className="h-4 w-4" />
            </Button>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
