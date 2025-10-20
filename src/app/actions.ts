
'use server';

import { routeUserPrompt } from '@/ai/flows/route-user-prompt';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define types that were previously in the flow file
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
type HistoryMessage = z.infer<typeof HistoryMessageSchema>;

const RouteUserPromptInputSchema = z.object({
  prompt: z.string().describe('The user prompt to analyze and route.'),
  baseImageDataUris: z.array(z.string()).optional().describe('Optional base images for image-to-image tasks.'),
  history: z.array(z.any()).optional().describe('Conversation history.'),
});
type RouteUserPromptInput = z.infer<typeof RouteUserPromptInputSchema>;


const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt kan ikke være tom.'),
  baseImageDataUris: z.array(z.string()).optional(),
  history: z.array(z.any()).optional(),
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

  const { prompt, baseImageDataUris, history } = validatedFields.data;

  const routeInput: RouteUserPromptInput = {
      prompt: prompt,
      baseImageDataUris: baseImageDataUris,
      history: (history as HistoryMessage[]) || [],
  };

  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await routeUserPrompt(routeInput);

      if (result.type === 'image') {
        return { data: { type: 'image', model: result.model, ...result.result } };
      } else if (result.type === 'video') {
        return { data: { type: 'video', model: result.model, ...result.result } };
      } else {
        return { data: { type: 'text', model: result.model, ...result.result } };
      }
    } catch (e: any) {
      lastError = e;
      const isRetryableError = e.message?.includes('FAILED_PRECONDITION');
      
      if (isRetryableError && attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt} failed with retryable error. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
      } else {
        // This was the last attempt or a non-retryable error
        console.error(e);
        return { error: e.message || 'Der opstod en uventet fejl.' };
      }
    }
  }

  // This should not be reached, but as a fallback:
  return { error: lastError?.message || 'Der opstod en uventet fejl efter flere forsøg.' };
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
