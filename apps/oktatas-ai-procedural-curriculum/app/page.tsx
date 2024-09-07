"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { experimental_useObject as useObject } from "ai/react";
import { getCurriculumSchema } from "@/schemas/curriculum";
import { CircleThing } from "@/components/circle-thing";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Section } from "@/components/section";

const NUMBER_OF_SECTIONS = 12;

export default function Page() {
  const { object, submit } = useObject({
    api: "/api/generate-curriculum",
    schema: getCurriculumSchema(NUMBER_OF_SECTIONS),
  });

  const [input, setInput] = useState("");
  const [curriculumProgress, setCurriculumProgress] = useState(0);

  const nextSection = () => {
    setCurriculumProgress((prev) => Math.min(prev + 1, NUMBER_OF_SECTIONS));
  };

  const previousSection = () => {
    setCurriculumProgress((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({
      query: input,
      numberOfSections: NUMBER_OF_SECTIONS,
    });
  };

  return (
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
              value={(curriculumProgress / NUMBER_OF_SECTIONS) * 100}
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
          <div className="container mx-auto px-8 py-4 h-full flex flex-col justify-between">
            <div>
              <Section section={object?.sections?.[curriculumProgress]} />
            </div>
            <div className="flex justify-between">
              <button onClick={previousSection}>Previous</button>
              <button onClick={nextSection}>Next</button>
            </div>
          </div>
        </div>
        <div className={cn("flex-none h-32 text-center")}>
          <div className="container mx-auto px-8 py-4 animate-pulse">
            <form onSubmit={onSubmit} className="flex space-x-4 relative">
              <Input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                className="rounded-full h-14 backdrop-filter backdrop-blur-md bg-white/80 shadow-lg"
              />
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                type="submit"
              >
                Learn
              </button>
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
  );
}
