import {
  type TInnerMultipleChoiceSection,
  type TInnerParagraphSection,
  type TInnerShortAnswerSection,
  type TPartialSection,
} from "@/schemas/curriculum";

export function Section({ section }: { section: TPartialSection | undefined }) {
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
    return <MultipleChoiceSection section={section.multiple_choice_section} />;
  } else if ("end_section" in section) {
    return <EndSection />;
  }

  return null;
}

function ParagraphSection({ section }: { section: TInnerParagraphSection }) {
  return (
    <section>
      <h2>Paragraph Section</h2>

      <p>{section.paragrah_content}</p>
    </section>
  );
}

function ShortAnswerSection({
  section,
}: {
  section: TInnerShortAnswerSection;
}) {
  return (
    <section>
      <h2>Short Answer Section</h2>

      <p>{section.question_content}</p>

      <p>Expected answer: {section.expected_answer}</p>
    </section>
  );
}

function MultipleChoiceSection({
  section,
}: {
  section: TInnerMultipleChoiceSection;
}) {
  return (
    <section>
      <h2>Multiple Choice Section</h2>

      <p>{section.question_content}</p>

      <ul>
        {section.choices?.map((choice, i) => (
          <li key={i}>{choice}</li>
        ))}
      </ul>

      <p>Correct choice: {section.correct_choice}</p>
    </section>
  );
}

function EndSection() {
  return (
    <section>
      <h2>🎉 End Section 🎉</h2>
    </section>
  );
}
