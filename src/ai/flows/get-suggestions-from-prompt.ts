'use server';

/**
 * @fileOverview Provides example prompts to the user to get them started.
 *
 * - getSuggestionsFromPrompt - A function that returns a list of suggestions.
 * - GetSuggestionsFromPromptInput - The input type for the getSuggestionsFromPrompt function.
 * - GetSuggestionsFromPromptOutput - The return type for the getSuggestionsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSuggestionsFromPromptInputSchema = z.object({
  modelType: z.enum(['Pro', 'Flash', 'Flash-Lite', 'Image']).describe('The type of model being used.'),
});
export type GetSuggestionsFromPromptInput = z.infer<typeof GetSuggestionsFromPromptInputSchema>;

const GetSuggestionsFromPromptOutputSchema = z.array(z.string());
export type GetSuggestionsFromPromptOutput = z.infer<typeof GetSuggestionsFromPromptOutputSchema>;

export async function getSuggestionsFromPrompt(input: GetSuggestionsFromPromptInput): Promise<GetSuggestionsFromPromptOutput> {
  return getSuggestionsFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSuggestionsFromPromptPrompt',
  input: {schema: GetSuggestionsFromPromptInputSchema},
  output: {schema: GetSuggestionsFromPromptOutputSchema},
  prompt: `You are an expert prompt generator for the Gemini AI model.

  Based on the model type, provide 3 diverse example prompts that the user can use as a starting point. The prompts should be tailored to the specific model type, and be as creative as possible. The prompts should be very different from each other.

  Model type: {{{modelType}}}

  Respond with a JSON array of strings.
  `,
});

const getSuggestionsFromPromptFlow = ai.defineFlow(
  {
    name: 'getSuggestionsFromPromptFlow',
    inputSchema: GetSuggestionsFromPromptInputSchema,
    outputSchema: GetSuggestionsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
