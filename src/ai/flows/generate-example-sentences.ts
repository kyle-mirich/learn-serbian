'use server';
/**
 * @fileOverview Generates instructional example sentences for Serbian words.
 *
 * - generateExampleSentences - A function that generates 3-5 example sentences showing how to use a Serbian word.
 * - GenerateExampleSentencesInput - The input type for the generateExampleSentences function.
 * - GenerateExampleSentencesOutput - The return type for the generateExampleSentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExampleSentencesInputSchema = z.object({
  serbianWord: z.string().describe('The Serbian word to generate examples for.'),
  englishTranslation: z.string().describe('The English translation of the word for context.'),
  partOfSpeech: z.string().optional().describe('The part of speech (noun, verb, adjective, etc.) for better context.'),
});
export type GenerateExampleSentencesInput = z.infer<typeof GenerateExampleSentencesInputSchema>;

const ExampleSentenceSchema = z.object({
  serbian: z.string().describe('The example sentence in Serbian.'),
  english: z.string().describe('The English translation of the example sentence.'),
  explanation: z.string().describe('A brief explanation of how the word is used in this context.'),
});

const GenerateExampleSentencesOutputSchema = z.object({
  examples: z.array(ExampleSentenceSchema).describe('Array of 3-5 example sentences showing different uses of the word.'),
});
export type GenerateExampleSentencesOutput = z.infer<typeof GenerateExampleSentencesOutputSchema>;

export async function generateExampleSentences(input: GenerateExampleSentencesInput): Promise<GenerateExampleSentencesOutput> {
  return generateExampleSentencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExampleSentencesPrompt',
  input: {schema: GenerateExampleSentencesInputSchema},
  output: {schema: GenerateExampleSentencesOutputSchema},
  prompt: `You are a Serbian language tutor helping students learn how to use Serbian words in context.

For the Serbian word "{{serbianWord}}" (which means "{{englishTranslation}}" in English{{#if partOfSpeech}}, and is a {{partOfSpeech}}{{/if}}), generate 3-5 instructional example sentences.

Each example should:
1. Show the word used in a natural, common Serbian sentence
2. Progress from simple to more complex usage
3. Demonstrate different grammatical contexts (if applicable)
4. Include the English translation
5. Provide a brief explanation of how the word functions in that specific sentence

Make the examples practical and relevant to everyday conversation. Focus on teaching the student not just what the word means, but HOW to use it correctly in different situations.`,
});

const generateExampleSentencesFlow = ai.defineFlow(
  {
    name: 'generateExampleSentencesFlow',
    inputSchema: GenerateExampleSentencesInputSchema,
    outputSchema: GenerateExampleSentencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
