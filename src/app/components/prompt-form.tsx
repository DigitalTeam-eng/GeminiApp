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
  prompt: z.string(),
});

interface PromptFormProps {
  onSubmit: (prompt: string, files: File[]) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const objectUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(objectUrls);

    // Free memory when the component is unmounted
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const resetFileState = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  function onFormSubmit(data: z.infer<typeof FormSchema>) {
     if (!data.prompt && selectedFiles.length === 0) {
        form.setError("prompt", { message: "Prompt kan ikke være tom."});
        return;
    }
    onSubmit(data.prompt, selectedFiles);
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
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
    }
  };

   const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newFiles);
    
    // Also update the input element's files
    if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        newFiles.forEach(file => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
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
            multiple
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
            {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative w-24 h-24">
                            <Image
                                src={url}
                                alt={`Forhåndsvisning ${index + 1}`}
                                width={96}
                                height={96}
                                className="rounded-md object-cover w-full h-full"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-0 right-0 h-6 w-6 rounded-full bg-black/50 hover:bg-black/75 text-white"
                                onClick={() => removeFile(index)}
                                aria-label={`Fjern billede ${index + 1}`}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={selectedFiles.length > 0 ? `Beskriv billederne...` : "Indtast din prompt her..."}
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
