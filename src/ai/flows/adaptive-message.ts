'use server';

/**
 * @fileOverview An AI agent that generates an adaptive message based on the player's game data.
 *
 * - generateAdaptiveMessage - A function that handles the generation of adaptive messages.
 * - AdaptiveMessageInput - The input type for the generateAdaptiveMessage function.
 * - AdaptiveMessageOutput - The return type for the generateAdaptiveMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveMessageInputSchema = z.object({
  score: z.number().describe('The player’s score in the game.'),
  health: z.number().describe('The player’s health at the end of the game.'),
});
export type AdaptiveMessageInput = z.infer<typeof AdaptiveMessageInputSchema>;

const AdaptiveMessageOutputSchema = z.object({
  message: z.string().describe('The adaptive message generated for the player.'),
});
export type AdaptiveMessageOutput = z.infer<typeof AdaptiveMessageOutputSchema>;

export async function generateAdaptiveMessage(
  input: AdaptiveMessageInput
): Promise<AdaptiveMessageOutput> {
  return adaptiveMessageFlow(input);
}

const adaptiveMessagePrompt = ai.definePrompt({
  name: 'adaptiveMessagePrompt',
  input: {schema: AdaptiveMessageInputSchema},
  output: {schema: AdaptiveMessageOutputSchema},
  prompt: `You are an AI that generates personalized messages based on the player's game performance in an educational game about the effects of underage drinking.

  Given the player's score and health at the end of the game, suggest a healthy course of action from the following options:
  - "Consider participating in school clubs that promote a healthy and sober lifestyle."
  - "Talk to a trusted adult about the dangers of underage drinking."
  - "Educate your friends about the risks and consequences of alcohol consumption."
  - "Practice saying no to peer pressure related to alcohol."
  - "Focus on healthy activities like sports, hobbies, or volunteering."

  The message should be encouraging and promote healthy choices related to underage drinking prevention.

  Score: {{{score}}}
  Health: {{{health}}}

  Based on this information generate the best message:
`,
});

const adaptiveMessageFlow = ai.defineFlow(
  {
    name: 'adaptiveMessageFlow',
    inputSchema: AdaptiveMessageInputSchema,
    outputSchema: AdaptiveMessageOutputSchema,
  },
  async input => {
    const {output} = await adaptiveMessagePrompt(input);
    return output!;
  }
);
