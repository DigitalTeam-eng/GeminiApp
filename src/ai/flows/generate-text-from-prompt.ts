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
import { Part } from '@genkit-ai/googleai';


const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;

const GenerateTextFromPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a response for.'),
  history: z.array(HistoryMessageSchema).optional().describe('The conversation history.'),
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
    const historyParts: Part[] = (input.history || []).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const promptForModel = [
        ...historyParts,
        { role: 'user', parts: [{ text: input.prompt }] },
    ];


    const {text} = await ai.generate({
        prompt: promptForModel as any, // Cast to any to handle structure
    });
    return {response: text};
  }
);
