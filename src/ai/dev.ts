import { config } from 'dotenv';
config();

import '@/ai/flows/generate-image-from-prompt.ts';
import '@/ai/flows/analyze-text-sentiment.ts';
import '@/ai/flows/get-suggestions-from-prompt.ts';
import '@/ai/flows/generate-text-from-prompt.ts';
import '@/ai/flows/route-user-prompt.ts';
