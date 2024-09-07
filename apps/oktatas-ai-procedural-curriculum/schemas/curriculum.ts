import { z } from "zod";

const baseSchema = z.object({
  n_sections_remaining: z
    .number()
    .describe("The number of sections remaining to be generated"),
});

const paragraphSchema = z.object({
  paragraph_section: baseSchema.extend({
    paragrah_content: z.string(),
  }),
});

const shortAnswerSchema = z.object({
  short_answer_section: baseSchema.extend({
    question_content: z.string(),
    expected_answer: z.string(),
  }),
});

const multipleChoiceSchema = z.object({
  multiple_choice_section: baseSchema.extend({
    question_content: z.string(),
    choices: z.array(z.string()),
    correct_choice: z
      .string()
      .describe("The correct choice text from the choices"),
  }),
});

const endSchema = z.object({
  end_section: baseSchema,
});

export function getCurriculumSchema(numberOfSections: number) {
  return z.object({
    sections: z
      .array(
        z.union([
          paragraphSchema,
          shortAnswerSchema,
          multipleChoiceSchema,
          endSchema,
        ])
      )
      .min(numberOfSections)
      .describe("A list of content sections"),
  });
}
