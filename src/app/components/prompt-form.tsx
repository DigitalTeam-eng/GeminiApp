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
import { Loader2, Paperclip, Send } from 'lucide-react';
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';

const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt kan ikke være tom.',
  }),
});

interface PromptFormProps {
  onSubmit: (prompt: string, file?: File) => void;
  isLoading: boolean;
}

export const PromptForm = forwardRef<{ setPrompt: (prompt: string) => void }, PromptFormProps>(({ onSubmit, isLoading }, ref) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useImperativeHandle(ref, () => ({
    setPrompt(prompt: string) {
      form.setValue('prompt', prompt);
    }
  }));


  function onFormSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data.prompt, selectedFile || undefined);
    form.reset();
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
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
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="flex-1">
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
});

PromptForm.displayName = 'PromptForm';
