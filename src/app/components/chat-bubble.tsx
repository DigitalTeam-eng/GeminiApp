'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <div
      className={cn(
        'flex items-start gap-4 animate-in fade-in',
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
          'max-w-[80%] rounded-2xl p-4',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card'
        )}
      >
        {role === 'assistant' ? (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        ) : (
          <p className="text-sm">{content}</p>
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
