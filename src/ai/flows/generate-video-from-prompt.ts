
'use server';

/**
 * @fileOverview Generates a video from a text prompt and an optional base image using the Veo model.
 *
 * - generateVideoFromPrompt - A function that handles the video generation process.
 * - GenerateVideoFromPromptInput - The input type for the generateVideoFromPrompt function.
 * - GenerateVideoFromPromptOutput - The return type for the generateVideoFromPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Part } from '@genkit-ai/googleai';
import { googleAI } from '@genkit-ai/googleai';

const GenerateVideoFromPromptInputSchema = z.object({
  promptText: z.string().describe('The text prompt to use for generating the video.'),
  baseImage: z.string().optional().describe(
    "An optional base image for image-to-video generation, as a data URI."
  ),
});
export type GenerateVideoFromPromptInput = z.infer<typeof GenerateVideoFromPromptInputSchema>;

const GenerateVideoFromPromptOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type GenerateVideoFromPromptOutput = z.infer<typeof GenerateVideoFromPromptOutputSchema>;

export async function generateVideoFromPrompt(
  input: GenerateVideoFromPromptInput
): Promise<GenerateVideoFromPromptOutput> {
  return generateVideoFromPromptFlow(input);
}

const generateVideoFromPromptFlow = ai.defineFlow(
  {
    name: 'generateVideoFromPromptFlow',
    inputSchema: GenerateVideoFromPromptInputSchema,
    outputSchema: GenerateVideoFromPromptOutputSchema,
  },
  async input => {
    const promptParts: (string | Part)[] = [{ text: input.promptText }];
    if (input.baseImage) {
      promptParts.push({ media: { url: input.baseImage } });
    }

    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: promptParts,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Video generation operation did not start.');
    }

    // Wait for the operation to complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media);
    if (!videoPart || !videoPart.media?.url) {
      throw new Error('No video was generated in the operation result.');
    }

    // Veo returns a file API URL, we need to fetch it and convert to a data URI.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    
    const fetch = (await import('node-fetch')).default;
    const videoUrlWithKey = `${videoPart.media.url}&key=${apiKey}`;
    const response = await fetch(videoUrlWithKey);

    if (!response.ok) {
        throw new Error(`Failed to fetch video file: ${response.statusText}`);
    }

    const videoBuffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const videoDataUri = `data:${contentType};base64,${videoBuffer.toString('base64')}`;

    return { videoDataUri };
  }
);
