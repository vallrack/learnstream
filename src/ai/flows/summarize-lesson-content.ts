'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing lesson content.
 *
 * - summarizeLessonContent - A function that requests a concise summary of provided lesson content.
 * - SummarizeLessonContentInput - The input type for the summarizeLessonContent function.
 * - SummarizeLessonContentOutput - The return type for the summarizeLessonContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLessonContentInputSchema = z.object({
  lessonContent: z.string().describe('The full content of the lesson to be summarized.'),
});
export type SummarizeLessonContentInput = z.infer<typeof SummarizeLessonContentInputSchema>;

const SummarizeLessonContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the lesson content.'),
});
export type SummarizeLessonContentOutput = z.infer<typeof SummarizeLessonContentOutputSchema>;

export async function summarizeLessonContent(
  input: SummarizeLessonContentInput
): Promise<SummarizeLessonContentOutput> {
  return summarizeLessonContentFlow(input);
}

const summarizeLessonContentPrompt = ai.definePrompt({
  name: 'summarizeLessonContentPrompt',
  input: {schema: SummarizeLessonContentInputSchema},
  output: {schema: SummarizeLessonContentOutputSchema},
  prompt: `Please provide a concise summary of the following lesson content. The summary should capture the main points and be easy to review.

Lesson Content:

---
{{{lessonContent}}}
---`,
});

const summarizeLessonContentFlow = ai.defineFlow(
  {
    name: 'summarizeLessonContentFlow',
    inputSchema: SummarizeLessonContentInputSchema,
    outputSchema: SummarizeLessonContentOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeLessonContentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary.');
    }
    return output;
  }
);
