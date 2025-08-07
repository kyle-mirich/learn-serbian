'use server';
/**
 * @fileOverview Translates a Serbian word to English.
 *
 * - translateSerbianWord - A function that translates a Serbian word to English.
 * - TranslateSerbianWordInput - The input type for the translateSerbianWord function.
 * - TranslateSerbianWordOutput - The return type for the translateSerbianWord function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSerbianWordInputSchema = z.object({
  serbianWord: z.string().describe('The Serbian word to translate.'),
});
export type TranslateSerbianWordInput = z.infer<typeof TranslateSerbianWordInputSchema>;

const TranslateSerbianWordOutputSchema = z.object({
  englishTranslation: z.string().describe('The English translation of the Serbian word.'),
});
export type TranslateSerbianWordOutput = z.infer<typeof TranslateSerbianWordOutputSchema>;

export async function translateSerbianWord(input: TranslateSerbianWordInput): Promise<TranslateSerbianWordOutput> {
  return translateSerbianWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateSerbianWordPrompt',
  input: {schema: TranslateSerbianWordInputSchema},
  output: {schema: TranslateSerbianWordOutputSchema},
  prompt: `Translate the following Serbian word to English:\n\n{{serbianWord}}`,
});

const translateSerbianWordFlow = ai.defineFlow(
  {
    name: 'translateSerbianWordFlow',
    inputSchema: TranslateSerbianWordInputSchema,
    outputSchema: TranslateSerbianWordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
