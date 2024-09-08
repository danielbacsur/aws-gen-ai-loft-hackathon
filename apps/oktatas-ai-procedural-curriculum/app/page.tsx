"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { experimental_useObject as useObject } from "ai/react";
import { getCurriculumSchema } from "@/schemas/curriculum";
import { CircleThing } from "@/components/circle-thing";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Section } from "@/components/section";
import { checkAnswer } from "./actions/check-answer/route";

const NUMBER_OF_SECTIONS = 12;

function useCurriculum() {
  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState("");

  const { object, submit: generateCurriculum } = useObject({
    api: "/api/generate-curriculum",
    schema: getCurriculumSchema(NUMBER_OF_SECTIONS),
  });

  const isAlreadyGenerated = !!object;

  const submit = async (fallback?: string) => {
    if (!isAlreadyGenerated) {
      generateCurriculum({
        query: input,
        numberOfSections: NUMBER_OF_SECTIONS,
      });
      setInput("");
      return;
    } else {
      const currentSection = object.sections?.[progress] || {};

      (async () => {
        if (
          "short_answer_section" in currentSection &&
          currentSection.short_answer_section
        ) {
          const result = await checkAnswer({
            question:
              currentSection.short_answer_section.question_content || "",
            expectedAnswer:
              currentSection.short_answer_section.expected_answer || "",
            userAnswer: fallback || input,
          });

          setInput("");
          if (result.isCorrect) {
            setProgress((prev) => Math.min(prev + 1, NUMBER_OF_SECTIONS));
          }
        } else if (
          "multiple_choice_section" in currentSection &&
          currentSection.multiple_choice_section
        ) {
          const result = await checkAnswer({
            question:
              currentSection.multiple_choice_section.question_content || "",
            choices:
              currentSection.multiple_choice_section.choices?.map(
                (c) => c || ""
              ) || [],
            expectedAnswer:
              currentSection.multiple_choice_section.correct_choice || "",
            userAnswer: fallback || input,
          });
          setInput("");
          if (result.isCorrect) {
            setProgress((prev) => Math.min(prev + 1, NUMBER_OF_SECTIONS));
          }
        } else if (
          "paragraph_section" in currentSection &&
          currentSection.paragraph_section
        ) {
          setProgress((prev) => Math.min(prev + 1, NUMBER_OF_SECTIONS));
        }
      })();
    }
  };

  const circular = useMemo(() => {
    const currentSection = object?.sections?.[progress] || {};

    if (
      "paragraph_section" in currentSection ||
      "end_section" in currentSection
    ) {
      return true;
    }

    return false;
  }, [progress, object]);

  const skip = () => {
    setProgress((prev) => Math.min(prev + 1, NUMBER_OF_SECTIONS));
  };

  return { object, submit, progress, input, setInput, circular, skip };
}

export default function Page() {
  const { object, submit, progress, input, setInput, circular, skip } =
    useCurriculum();

  const inputRef = useRef<HTMLInputElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (circular) {
      skipButtonRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [progress, circular]);

  return (
    <>
      <div className="h-full flex flex-col justify-center">
        <div
          className={cn(
            "overflow-hidden flex-none",
            object ? "" : "h-0",
            "transition-all duration-500"
          )}
        >
          <div className="container mx-auto px-8 py-12">
            <div className="w-full h-4 relative">
              <Progress
                value={
                  ((object?.sections?.length || 0) / NUMBER_OF_SECTIONS) * 100
                }
                outerClassName="absolute top-0 left-0 w-full h-full z-10 bg-gray-200"
                innerClassName="bg-gray-400"
              />
              <Progress
                value={(progress / NUMBER_OF_SECTIONS) * 100}
                outerClassName="absolute top-0 left-0 w-full h-full z-20 bg-transparent"
                innerClassName="bg-gray-800"
              />
            </div>
          </div>
        </div>

        <main className="h-full flex flex-col justify-center">
          <div
            className={cn(
              "overflow-hidden flex-none text-center",
              object ? "h-0" : "pb-8",
              "transition-all duration-500"
            )}
          >
            <div className="container mx-auto px-8 py-12">
              <h1>
                What do you want <br /> to learn today?
              </h1>
            </div>
          </div>
          <div
            className={cn(
              object ? "" : "sm:flex-none h-60 md:h-0 bg-transparent",
              "transition-all duration-500"
            )}
          ></div>
          <div
            className={cn(
              "overflow-hidden grid place-items-center",
              object ? "flex-grow" : "flex-none h-0",
              "transition-all duration-500"
            )}
          >
            <div className="container mx-auto px-8 py-4 h-full flex flex-col justify-center max-w-2xl">
              <Section section={object?.sections?.[progress]} submit={submit} />
            </div>
          </div>
          <div className={cn("flex-none h-32 text-center")}>
            <div className="container mx-auto px-8 py-4 animate-pulse">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="flex space-x-4 relative"
              >
                {circular ? (
                  <button
                    ref={skipButtonRef}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    onClick={skip}
                  >
                    Skip
                  </button>
                ) : (
                  <>
                    <Input
                      id="query"
                      value={input}
                      ref={inputRef}
                      onChange={(e) => setInput(e.target.value)}
                      className="rounded-full h-14 backdrop-filter backdrop-blur-md bg-white/80 shadow-lg"
                    />
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      type="submit"
                    >
                      Learn
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </main>

        <div
          className={cn(
            "absolute top-0 left-0 right-0 bottom-0 -z-10 pointer-events-none",
            object ? "opacity-0" : "opacity-50"
          )}
        >
          <CircleThing />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 text-[8px] text-gray-400">
        {JSON.stringify(object?.sections?.[progress])}
      </div>
    </>
  );
}
