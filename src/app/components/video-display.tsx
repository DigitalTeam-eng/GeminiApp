
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VideoDisplayProps {
  src: string;
  prompt: string;
  model?: string;
}

export function VideoDisplay({ src, prompt, model }: VideoDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    const fileName = prompt.replace(/\s+/g, '_').toLowerCase().slice(0, 20);
    link.download = `${fileName || 'genereret-video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-start gap-4 my-4 justify-start animate-in fade-in">
      <Avatar className="h-8 w-8">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="group relative overflow-hidden rounded-2xl bg-card p-2">
          <video
            src={src}
            controls
            autoPlay
            loop
            muted
            className="rounded-lg max-w-full"
            style={{ maxWidth: '512px' }}
          />
          <Button
            onClick={handleDownload}
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Download video"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        {model && (
            <Badge variant="outline" className="self-start text-xs">
                Genereret med {model}
            </Badge>
        )}
      </div>
    </div>
  );
}
