
'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatBubble } from './chat-bubble';

interface UserImageDisplayProps {
  src: string;
  prompt: string;
}

export function UserImageDisplay({ src, prompt }: UserImageDisplayProps) {
  return (
    <div className="flex flex-col items-end gap-2 animate-in fade-in">
        <div className="flex items-start gap-4 justify-end w-full">
            <div
                className="group relative overflow-hidden rounded-2xl bg-primary p-2 max-w-[50%]"
            >
                <Image
                src={src}
                alt={prompt}
                width={256}
                height={256}
                className="rounded-lg"
                />
            </div>
            <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        </div>
        {prompt && (
            <ChatBubble role="user" content={prompt} />
        )}
    </div>
  );
}
