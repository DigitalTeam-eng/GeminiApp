'use server';

import { analyzeTextSentiment } from '@/ai/flows/analyze-text-sentiment';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty.'),
  model: z.enum(['Pro', 'Flash', 'Flash-Lite', 'Image']),
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
    return { error: 'Invalid input.' };
  }

  const { prompt, model } = validatedFields.data;

  try {
    if (model === 'Image') {
      const result = await generateImageFromPrompt({ promptText: prompt });
      return { data: result };
    } else {
      const result = await analyzeTextSentiment({ text: prompt });
      return { data: result };
    }
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}
