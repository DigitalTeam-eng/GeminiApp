'use server';

import { generateImageFromPrompt, GenerateImageFromPromptInput } from '@/ai/flows/generate-image-from-prompt';
import { generateTextFromPrompt, GenerateTextFromPromptInput, HistoryMessage } from '@/ai/flows/generate-text-from-prompt';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt kan ikke være tom.'),
  model: z.enum(['Pro', 'Flash', 'Flash-Lite', 'Image']),
  baseImageDataUris: z.array(z.string()).optional(),
  history: z.array(z.any()).optional(), // Brug 'any' for at undgå at skulle definere skemaet her
});

type ResponseType = {
  data?: any;
  error?: string;
};

export async function generateResponse(
  values: z.infer<typeof formSchema>
): Promise<ResponseType> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Ugyldigt input.' };
  }

  const { prompt, model, baseImageDataUris, history } = validatedFields.data;

  try {
    if (model === 'Image') {
      const imageGenInput: GenerateImageFromPromptInput = { 
        promptText: prompt,
      };
      if (baseImageDataUris && baseImageDataUris.length > 0) {
        imageGenInput.baseImages = baseImageDataUris.map(dataUri => ({ dataUri }));
      }
      const result = await generateImageFromPrompt(imageGenInput);
      return { data: result };
    } else {
      const textGenInput: GenerateTextFromPromptInput = { 
        prompt: prompt,
        history: (history as HistoryMessage[]) || [],
       };
      const result = await generateTextFromPrompt(textGenInput);
      return { data: result };
    }
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Der opstod en uventet fejl.' };
  }
}

const generateTitleSchema = z.object({
    prompt: z.string(),
});

export async function generateConversationTitle(values: z.infer<typeof generateTitleSchema>): Promise<string> {
    const validatedFields = generateTitleSchema.safeParse(values);
    if (!validatedFields.success) {
        throw new Error('Invalid input for title generation.');
    }
    const { prompt } = validatedFields.data;
    
    const { text } = await ai.generate({
        prompt: `Generer en kort, sigende titel (maks 4 ord) til en samtale, der starter med følgende prompt. Svar kun med titlen.:\n\n${prompt}`,
        config: {
            temperature: 0.3,
        }
    });

    return text.replace(/"/g, ''); // Fjerner anførselstegn hvis modellen tilføjer dem
}
