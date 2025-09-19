'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentiment of a text prompt.
 *
 * - analyzeTextSentiment - A function that takes a text prompt and returns its sentiment analysis.
 * - AnalyzeTextSentimentInput - The input type for the analyzeTextSentiment function.
 * - AnalyzeTextSentimentOutput - The return type for the analyzeTextSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextSentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze for sentiment.'),
});
export type AnalyzeTextSentimentInput = z.infer<typeof AnalyzeTextSentimentInputSchema>;

const AnalyzeTextSentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the text, such as positive, negative, or neutral.'
    ),
  score: z.number().describe('A numerical score representing the sentiment strength.'),
});
export type AnalyzeTextSentimentOutput = z.infer<typeof AnalyzeTextSentimentOutputSchema>;

export async function analyzeTextSentiment(
  input: AnalyzeTextSentimentInput
): Promise<AnalyzeTextSentimentOutput> {
  return analyzeTextSentimentFlow(input);
}

const analyzeTextSentimentPrompt = ai.definePrompt({
  name: 'analyzeTextSentimentPrompt',
  input: {schema: AnalyzeTextSentimentInputSchema},
  output: {schema: AnalyzeTextSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following text:\n\n{{text}}\n\nDetermine whether the sentiment is positive, negative, or neutral. Also, provide a numerical score from -1 (negative) to 1 (positive) indicating the sentiment strength.\n\nOutput the sentiment and score in JSON format.`,
});

const analyzeTextSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeTextSentimentFlow',
    inputSchema: AnalyzeTextSentimentInputSchema,
    outputSchema: AnalyzeTextSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextSentimentPrompt(input);
    return output!;
  }
);
