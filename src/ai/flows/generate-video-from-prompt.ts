
'use server';

/**
 * @fileOverview Generates a video from a text prompt and an optional base image using the Veo model.
 *
 * - generateVideoFromPrompt - A function that handles the video generation process.
 * - GenerateVideoFromPromptInput - The input type for the generateVideoFromPrompt function.
 * - GenerateVideoFromPromptOutput - The return type for the generateVideoFromPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Part } from '@genkit-ai/googleai';
import { googleAI } from '@genkit-ai/googleai';

// Helper function to parse a data URI
function parseDataUri(dataUri: string): { mimeType: string; base64Data: string } | null {
  const match = dataUri.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    // It might not be a data URI, e.g., a file API URL from Veo itself.
    // For now, we only handle data URIs as input from the client.
    console.warn("Could not parse data URI:", dataUri.substring(0, 50) + "...");
    return null;
  }
  return { mimeType: match[1], base64Data: match[2] };
}


const GenerateVideoFromPromptInputSchema = z.object({
  promptText: z.string().describe('The text prompt to use for generating the video.'),
  baseImage: z.string().optional().describe(
    "An optional base image/video for generation, as a data URI."
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
    const promptParts: Part[] = [{ text: input.promptText }];
    if (input.baseImage) {
      const parsed = parseDataUri(input.baseImage);
      if (parsed) {
        promptParts.push({
          media: {
            contentType: parsed.mimeType,
            url: `data:${parsed.mimeType};base64,${parsed.base64Data}`,
          },
        });
      }
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
        const errorBody = await response.text();
        throw new Error(`Failed to fetch video file: ${response.statusText}. Body: ${errorBody}`);
    }

    const videoBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const videoDataUri = `data:${contentType};base64,${Buffer.from(videoBuffer).toString('base64')}`;

    return { videoDataUri };
  }
);
