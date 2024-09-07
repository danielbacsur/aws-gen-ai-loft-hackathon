"use client";

import { experimental_useObject as useObject } from "ai/react";
import { getCurriculumSchema } from "@/schemas/curriculum";

const NUMBER_OF_SECTIONS = 12;

const tailwindColorsPerSectionType: Record<string, string> = {
  paragraph_section: "bg-blue-600",
  short_answer_section: "bg-green-600",
  multiple_choice_section: "bg-yellow-600",
  end_section: "bg-red-600",
};

export default function Page() {
  const { object, submit } = useObject({
    api: "/api/generate-curriculum",
    schema: getCurriculumSchema(NUMBER_OF_SECTIONS),
  });

  return (
    <>
      <button
        onClick={() =>
          submit({
            query: "quantum computing.",
            numberOfSections: NUMBER_OF_SECTIONS,
          })
        }
      >
        Generate notifications
      </button>

      {object?.sections?.map((section, index) => {
        if (!section) return null;

        return (
          <div
            className={tailwindColorsPerSectionType[Object.keys(section)[0]]}
            key={index}
          >
            {JSON.stringify(section)}
          </div>
        );
      })}
    </>
  );
}
