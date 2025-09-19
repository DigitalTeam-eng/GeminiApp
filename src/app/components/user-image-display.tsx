
'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatBubble } from './chat-bubble';

interface UserImageDisplayProps {
  srcs: string[];
  prompt: string;
}

export function UserImageDisplay({ srcs, prompt }: UserImageDisplayProps) {
  return (
    <div className="flex flex-col items-end gap-2 animate-in fade-in">
        <div className="flex items-start gap-4 justify-end w-full">
            <div
                className="group relative grid grid-cols-2 gap-2 overflow-hidden rounded-2xl bg-primary p-2 max-w-[50%]"
            >
                {srcs.map((src, index) => (
                    <Image
                        key={index}
                        src={src}
                        alt={`${prompt} - billede ${index + 1}`}
                        width={128}
                        height={128}
                        className="rounded-lg aspect-square object-cover"
                    />
                ))}
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
