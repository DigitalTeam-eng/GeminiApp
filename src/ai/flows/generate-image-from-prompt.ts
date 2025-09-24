// Implemented the Genkit flow for generating images from a text prompt using a selected image model.

'use server';

/**
 * @fileOverview Generates an image from a text prompt using a selected image model.
 * It supports both text-to-image and image-to-image generation.
 *
 * - generateImageFromPrompt - A function that handles the image generation process.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Part} from '@genkit-ai/googleai';

const GenerateImageFromPromptInputSchema = z.object({
  promptText: z.string().describe('The text prompt to use for generating the image.'),
  baseImages: z
    .array(
      z.object({
        dataUri: z
          .string()
          .describe(
            "A base image for editing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
          ),
      })
    )
    .optional(),
});
export type GenerateImageFromPromptInput = z.infer<
  typeof GenerateImageFromPromptInputSchema
>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The generated image as a data URI that includes a MIME type and uses Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateImageFromPromptOutput = z.infer<
  typeof GenerateImageFromPromptOutputSchema
>;

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async input => {
    let modelToUse: string;
    let promptForModel: (string | Part)[] | string;
    let config: any = {};

    if (input.baseImages && input.baseImages.length > 0) {
      // Image-to-image generation
      modelToUse = 'googleai/gemini-2.5-flash-image-preview'; // "Nano Banana"
      
      const promptParts: Part[] = [{ text: input.promptText }];
      input.baseImages.forEach(image => {
        promptParts.push({ media: { url: image.dataUri } });
      });
      
      promptForModel = promptParts;
      
      config = {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
        ],
      };
    } else {
      // Text-to-image generation
      modelToUse = 'googleai/imagen-4.0-fast-generate-001';
      promptForModel = input.promptText;
    }

    const {media} = await ai.generate({
      model: modelToUse,
      prompt: promptForModel,
      config: config,
    });
    
    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }

    return {imageDataUri: media.url};
  }
);
