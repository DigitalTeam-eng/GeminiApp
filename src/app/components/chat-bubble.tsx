
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { FormattedContent } from './formatted-content';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
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
          'relative max-w-[80%] rounded-2xl p-4 prose dark:prose-invert prose-p:my-0',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card'
        )}
      >
        {isAssistant ? (
            <FormattedContent content={content} />
        ) : (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
        )}
        {isAssistant && (
           <Button
              onClick={handleCopy}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Kopier indhold"
            >
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
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
