'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Paperclip, Send, X } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt kan ikke være tom.',
  }),
});

interface PromptFormProps {
  onSubmit: (prompt: string, file?: File) => void;
  isLoading: boolean;
}

export const PromptForm = ({ onSubmit, isLoading }: PromptFormProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Free memory when the component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const resetFileState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  function onFormSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data.prompt, selectedFile || undefined);
    form.reset();
    resetFileState();
  }
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onFormSubmit)();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    } else {
      resetFileState();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="flex w-full items-start gap-4"
      >
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
        />
        <Button 
            type="button" 
            variant="ghost"
            size="icon" 
            onClick={handleAttachClick} 
            disabled={isLoading}
            aria-label="Vedhæft fil"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="flex-1 space-y-2">
            {previewUrl && (
                <div className="relative w-24 h-24">
                    <Image
                        src={previewUrl}
                        alt="Forhåndsvisning"
                        width={96}
                        height={96}
                        className="rounded-md object-cover w-full h-full"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6 rounded-full bg-black/50 hover:bg-black/75 text-white"
                        onClick={resetFileState}
                        aria-label="Fjern billede"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={selectedFile ? `Beskriv billedet '${selectedFile.name}'...` : "Indtast din prompt her..."}
                      className="resize-none"
                      {...field}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <Button type="submit" disabled={isLoading} size="icon" aria-label="Send prompt">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Form>
  );
};

PromptForm.displayName = 'PromptForm';
