import { getCurriculumSchema } from "@/schemas/curriculum";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

export async function POST(req: Request) {
  const { query, numberOfSections } = (await req.json()) as {
    query: string;
    numberOfSections: number;
  };

  const result = await streamObject({
    model: openai("gpt-4o-2024-08-06"),
    system: `Your task is to make a sequential learning experience. Use a combination of all the different types of content to make the learning experience engaging and informative. 
Always provide a paragraph section before questions, so the user can acquire the knowledge needed to answer the questions. In total you have to make ${numberOfSections} number of sections. 
The first section you make has to have n_generations_remaining=${numberOfSections}. From that point on decrement n_generations_remaining by 1 from the previous section when generating the next section. 
When n_generations_remaining=0, use an 'end_section'.`,
    prompt: `The user wants to learn about: ${query}`,
    schema: getCurriculumSchema(numberOfSections),
    maxTokens: numberOfSections * 120,
  });

  return result.toTextStreamResponse();
}
