'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating text from a prompt.
 *
 * - generateTextFromPrompt - A function that takes a text prompt and returns a generated text response.
 * - GenerateTextFromPromptInput - The input type for the generateTextFromPrompt function.
 * - GenerateTextFromPromptOutput - The return type for the generateTextFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextFromPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a response for.'),
});
export type GenerateTextFromPromptInput = z.infer<typeof GenerateTextFromPromptInputSchema>;

const GenerateTextFromPromptOutputSchema = z.object({
  response: z.string().describe('The generated text response.'),
});
export type GenerateTextFromPromptOutput = z.infer<typeof GenerateTextFromPromptOutputSchema>;

export async function generateTextFromPrompt(
  input: GenerateTextFromPromptInput
): Promise<GenerateTextFromPromptOutput> {
  return generateTextFromPromptFlow(input);
}

const generateTextFromPromptFlow = ai.defineFlow(
  {
    name: 'generateTextFromPromptFlow',
    inputSchema: GenerateTextFromPromptInputSchema,
    outputSchema: GenerateTextFromPromptOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
        prompt: input.prompt,
    });
    return {response: text};
  }
);
