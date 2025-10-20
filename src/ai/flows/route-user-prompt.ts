
'use server';

/**
 * @fileOverview This file defines a Genkit flow for routing a user's prompt to the appropriate model (text, image, or video).
 *
 * - routeUserPrompt - A function that analyzes a prompt and routes it.
 * - RouteUserPromptInput - The input type for the routeUserPrompt function.
 * - RouteUserPromptOutput - The return type for the routeUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
    generateTextFromPrompt,
    GenerateTextFromPromptInput,
} from './generate-text-from-prompt';
import {
    generateImageFromPrompt,
    GenerateImageFromPromptInput,
} from './generate-image-from-prompt';
import {
    generateVideoFromPrompt,
    GenerateVideoFromPromptInput,
} from './generate-video-from-prompt';


const RouteUserPromptInputSchema = z.object({
  prompt: z.string().describe('The user prompt to analyze and route.'),
  baseImageDataUris: z.array(z.string()).optional().describe('Optional base images for image-to-image tasks.'),
  history: z.array(z.any()).optional().describe('Conversation history.'),
});
type RouteUserPromptInput = z.infer<typeof RouteUserPromptInputSchema>;

const RouteUserPromptOutputSchema = z.object({
    type: z.enum(['text', 'image', 'video']),
    result: z.any(),
    model: z.string().describe('The name of the model used to generate the response.'),
});
type RouteUserPromptOutput = z.infer<typeof RouteUserPromptOutputSchema>;


export async function routeUserPrompt(input: RouteUserPromptInput): Promise<RouteUserPromptOutput> {
  return routeUserPromptFlow(input);
}


const routeUserPromptFlow = ai.defineFlow(
  {
    name: 'routeUserPromptFlow',
    inputSchema: RouteUserPromptInputSchema,
    outputSchema: RouteUserPromptOutputSchema,
  },
  async (input) => {
    let modelToUse: string;

    // Ask the model to classify the prompt.
    const classificationPrompt = ai.definePrompt({
        name: 'classifyPrompt',
        input: { schema: z.object({ prompt: z.string() }) },
        output: { schema: z.object({ task: z.enum(['image_generation', 'video_generation', 'text_generation']) }) },
        prompt: `Analyze the following user prompt and classify the primary task as 'image_generation', 'video_generation', or 'text_generation'.

        User Prompt: "{{prompt}}"

        - If the prompt explicitly asks to "draw", "create an image", "generate a picture", or similar artistic commands, classify it as 'image_generation'.
        - If the prompt explicitly asks to "animate", "create a video", "make it move", or similar animation commands, classify it as 'video_generation'.
        - For all other queries, including questions, requests for information, code, or text, classify it as 'text_generation'.

        Respond with only the classification in JSON format.`,
    });

    const { output } = await classificationPrompt({ prompt: input.prompt });

    if (output?.task === 'video_generation') {
        modelToUse = 'Veo';
        const videoInput: GenerateVideoFromPromptInput = {
            promptText: input.prompt,
            baseImage: input.baseImageDataUris?.[0]
        };
        const result = await generateVideoFromPrompt(videoInput);
        return { type: 'video', result, model: modelToUse };
    }

    if (output?.task === 'image_generation' || (input.baseImageDataUris && input.baseImageDataUris.length > 0)) {
        modelToUse = (input.baseImageDataUris && input.baseImageDataUris.length > 0) ? 'Gemini Flash Image' : 'Imagen';
        const imageInput: GenerateImageFromPromptInput = {
            promptText: input.prompt,
            baseImages: input.baseImageDataUris?.map(dataUri => ({ dataUri }))
        };
        const result = await generateImageFromPrompt(imageInput);
        return { type: 'image', result, model: modelToUse };
    } 
    
    // Default to text generation
    modelToUse = 'Gemini Flash';
    const textInput: GenerateTextFromPromptInput = { 
        prompt: input.prompt,
        history: input.history || []
    };
    const result = await generateTextFromPrompt(textInput);
    return { type: 'text', result, model: modelToUse };
  }
);
