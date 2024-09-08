"use client";

import {
  type TInnerMultipleChoiceSection,
  type TInnerParagraphSection,
  type TInnerShortAnswerSection,
  type TPartialSection,
} from "@/schemas/curriculum";
import { Confetti } from "@/components/confetti";

export function Section({
  section,
  submit,
}: {
  section: TPartialSection | undefined;
  submit: () => Promise<void>;
}) {
  if (!section) return null;

  if ("paragraph_section" in section && section.paragraph_section) {
    return <ParagraphSection section={section.paragraph_section} />;
  } else if (
    "short_answer_section" in section &&
    section.short_answer_section
  ) {
    return <ShortAnswerSection section={section.short_answer_section} />;
  } else if (
    "multiple_choice_section" in section &&
    section.multiple_choice_section
  ) {
    return (
      <MultipleChoiceSection
        section={section.multiple_choice_section}
        submit={submit}
      />
    );
  } else if ("end_section" in section) {
    return <EndSection />;
  }

  return null;
}

function ParagraphSection({ section }: { section: TInnerParagraphSection }) {
  return (
    <section className="w-full">
      <h2>{section.paragraph_title}</h2>

      <p>{section.paragraph_content}</p>
    </section>
  );
}

function ShortAnswerSection({
  section,
}: {
  section: TInnerShortAnswerSection;
}) {
  return (
    <section className="w-full">
      <h2>{section.question_content}</h2>
    </section>
  );
}

function MultipleChoiceSection({
  section,
  submit,
}: {
  section: TInnerMultipleChoiceSection;
  submit: (fallback: string) => Promise<void>;
}) {
  return (
    <section className="w-full">
      <h2>{section.question_content}</h2>

      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        {section.choices?.map((choice, i) => (
          <button
            key={i}
            className="p-4 border border-gray-300 rounded-md"
            onClick={() => {
              submit(choice || "");
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    </section>
  );
}

function EndSection() {
  return (
    <section className="w-full">
      <h2>🎉 End Section 🎉</h2>
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
        <Confetti isActive duration={5000} />
      </div>
    </section>
  );
}
