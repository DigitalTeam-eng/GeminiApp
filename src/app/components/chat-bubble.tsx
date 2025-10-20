
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormattedContent } from './formatted-content';
import { Badge } from '@/components/ui/badge';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  userInitials?: string;
}

export function ChatBubble({ role, content, model, userInitials }: ChatBubbleProps) {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

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
      <div className="flex flex-col gap-2">
        <div
          className={cn(
            'relative max-w-[80%] rounded-2xl p-4 prose dark:prose-invert prose-p:my-0',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-card'
          )}
        >
          {isAssistant ? (
              <FormattedContent content={content} />
          ) : (
              <p className="whitespace-pre-wrap text-sm">{content}</p>
          )}
        </div>
         {isAssistant && model && (
            <Badge variant="outline" className="self-start text-xs">
                Genereret med {model}
            </Badge>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
