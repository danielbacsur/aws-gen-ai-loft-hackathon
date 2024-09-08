"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const answerCheckingSchema = z.object({
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

export async function checkAnswer({
  question,
  userAnswer,
  expectedAnswer,
  choices,
}: {
  question: string;
  userAnswer: string;
  expectedAnswer: string;
  choices?: string[];
}) {
  "use server";
  const { object: result } = await generateObject({
    model: openai("gpt-4o-2024-08-06"),
    system: `Your task is to answer the check the student's answer. If the answer is incorrect, please explain to the student why it is incorrect. At multiple-choice questions, decide if the student's answer is the closest to the correct answer from the choices available. If the answer is partially correct accept it as the correct answer.`,
    prompt: `The question was: "${question}"
The student answered: "${userAnswer}"
The correct answer is: "${expectedAnswer}"
${
  choices
    ? `The choices were: ${choices
        .map((choice, i) => `${i + 1}. ${choice}`)
        .join(", ")}`
    : ""
}
Is the student's answer correct? If not, explain why.`,
    schema: answerCheckingSchema,
    maxTokens: 200,
  });

  console.log(result);

  return result;
}
