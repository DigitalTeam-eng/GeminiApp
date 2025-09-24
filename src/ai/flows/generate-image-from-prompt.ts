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
    
    const safetySettings = [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ];
    
    config = { responseModalities: ['TEXT', 'IMAGE'], safetySettings };

    if (input.baseImages && input.baseImages.length > 0) {
      modelToUse = 'googleai/gemini-2.5-flash-image-preview'; // "Nano Banana"
      
      const transparencyKeywords = ['transparent', 'gennemsigtig', 'remove background'];
      const requiresTransparency = transparencyKeywords.some(keyword =>
        input.promptText.toLowerCase().includes(keyword)
      );

      if (requiresTransparency) {
        // Step 1: Generate a mask
        const maskPromptParts: Part[] = [
            { text: "Generate a segmentation mask. Make the background solid white and the main subject solid black." }
        ];
        input.baseImages.forEach(image => {
            maskPromptParts.push({ media: { url: image.dataUri } });
        });

        const { media: maskMedia } = await ai.generate({
          model: modelToUse,
          prompt: maskPromptParts,
          config: config,
        });

        if (!maskMedia || !maskMedia.url) {
          throw new Error('Mask generation failed.');
        }

        // Step 2: Use the mask to create the transparent image
        const finalPromptParts: Part[] = [
          { text: "Using the provided mask, replace the background of the original image with an alpha channel to make it transparent. The output must be a PNG file with a true alpha channel." },
        ];
         input.baseImages.forEach(image => { // Original image
            finalPromptParts.push({ media: { url: image.dataUri } });
        });
        finalPromptParts.push({ media: { url: maskMedia.url } }); // Mask

        const { media: finalMedia } = await ai.generate({
          model: modelToUse,
          prompt: finalPromptParts,
          config: config,
        });
        
        if (!finalMedia || !finalMedia.url) {
            throw new Error('Final transparent image generation failed.');
        }

        return { imageDataUri: finalMedia.url };
      }

      // Default image-to-image without transparency
      const promptParts: Part[] = [{ text: input.promptText }];
      input.baseImages.forEach(image => {
        promptParts.push({ media: { url: image.dataUri } });
      });
      promptForModel = promptParts;
      
    } else {
      // Text-to-image generation
      modelToUse = 'googleai/imagen-4.0-fast-generate-001';
      promptForModel = input.promptText;
      config = {}; // Reset config for text-to-image
    }

    const { media } = await ai.generate({
      model: modelToUse,
      prompt: promptForModel,
      config: config,
    });
    
    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }

    return { imageDataUri: media.url };
  }
);
