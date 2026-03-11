'use server';
/**
 * @fileOverview An AI lesson assistant that answers questions based on provided lesson content.
 *
 * - askLessonQuestions - A function that handles answering student questions about lesson content.
 * - AskLessonQuestionsInput - The input type for the askLessonQuestions function.
 * - AskLessonQuestionsOutput - The return type for the askLessonQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskLessonQuestionsInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
  lessonContent: z.string().describe('The textual content of the lesson.'),
});
export type AskLessonQuestionsInput = z.infer<typeof AskLessonQuestionsInputSchema>;

const AskLessonQuestionsOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the student\'s question, based on the lesson content.'),
});
export type AskLessonQuestionsOutput = z.infer<typeof AskLessonQuestionsOutputSchema>;

export async function askLessonQuestions(input: AskLessonQuestionsInput): Promise<AskLessonQuestionsOutput> {
  return askLessonQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askLessonQuestionsPrompt',
  input: {schema: AskLessonQuestionsInputSchema},
  output: {schema: AskLessonQuestionsOutputSchema},
  prompt: `You are an AI lesson assistant. Your task is to answer a student's question based *only* on the provided lesson content.
Do not use any outside knowledge.
If the answer is not present in the lesson content, state that you cannot find the answer in the provided material.

Lesson Content:
---
{{{lessonContent}}}
---

Student's Question: "{{{question}}}"

Provide a concise and accurate answer.`, 
});

const askLessonQuestionsFlow = ai.defineFlow(
  {
    name: 'askLessonQuestionsFlow',
    inputSchema: AskLessonQuestionsInputSchema,
    outputSchema: AskLessonQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
