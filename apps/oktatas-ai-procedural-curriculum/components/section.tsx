// @ts-nocheck
"use client";


import {
  type TInnerMultipleChoiceSection,
  type TInnerParagraphSection,
  type TInnerShortAnswerSection,
  type TPartialSection,
} from "@/schemas/curriculum";
import { Confetti } from "@/components/confetti";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

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



const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!;
const VOICE_ID = "XrExE9yKIg1WjnnlVkGX";

const lerp = (start, end, t) => start * (1 - t) + end * t;

const ProgressBar = ({ current, total }) => {
  const progress = Math.min((current / total) * 100, 100);
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

function ParagraphSection({ section }: { section: TInnerParagraphSection }) {
  const [isReading, setIsReading] = useState(false);
  const [wordTimestamps, setWordTimestamps] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [smoothCurrentTime, setSmoothCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      // Clean up on component unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const readText = async () => {
    setIsReading(true);
    socketRef.current = new WebSocket(
      `wss://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream-input?model_id=eleven_monolingual_v1`
    );

    socketRef.current.onopen = () => {
      socketRef.current.send(
        JSON.stringify({
          text: " ",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
          xi_api_key: ELEVENLABS_API_KEY,
        })
      );

      socketRef.current.send(JSON.stringify({ text: section.paragraph_content }));
      socketRef.current.send(JSON.stringify({ text: "" }));
    };

    let audioChunks = [];
    let timestamps = [];
    let offset = 0;

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.audio) {
        audioChunks.push(
          new Uint8Array(
            atob(message.audio)
              .split("")
              .map((char) => char.charCodeAt(0))
          )
        );

        if (message.normalizedAlignment) {
          const { chars, charStartTimesMs, charDurationsMs } = message.normalizedAlignment;
          let words = [];
          let currentWord = "";
          let currentWordStart = null;

          chars.forEach((char, index) => {
            if (char === " " || index === chars.length - 1) {
              if (currentWord) {
                words.push({
                  word: currentWord,
                  start: currentWordStart + offset,
                  end: charStartTimesMs[index] + charDurationsMs[index] + offset,
                });
                currentWord = "";
                currentWordStart = null;
              }
            } else {
              if (currentWordStart === null) {
                currentWordStart = charStartTimesMs[index];
              }
              currentWord += char;
            }
          });

          timestamps = [...timestamps, ...words];
          offset += charStartTimesMs[charStartTimesMs.length - 1] + charDurationsMs[charDurationsMs.length - 1];
        }
      } else if (message.isFinal) {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
        setWordTimestamps(timestamps);
        setIsReading(false);
        socketRef.current.close();
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setIsReading(false);
    };
  };

  const stopSpeech = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsReading(false);
    setCurrentTime(0);
    setSmoothCurrentTime(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
    const handleLoadedMetadata = () => setAudioDuration(audio.duration * 1000);

    let animationFrameId;
    const animate = () => {
      setSmoothCurrentTime((prev) => {
        const target = audio.currentTime * 1000;
        return lerp(prev, target, 0.5);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    animate();

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const renderHighlightedText = () => {
    if (wordTimestamps.length === 0) return section.paragraph_content;

    return wordTimestamps.map((word, index) => (
      <span
        key={index}
        data-word-index={index}
        className={cn(
          currentTime >= word.start 
            ? "animate-text-highlight" : "text-black"
        )}
      >
        {word.word}{" "}
      </span>
    ));
  };

  return (
    <section className="w-full">
      <h2>{section.paragraph_title}</h2>
      
      <div className="w-full mb-4">
        <ProgressBar current={smoothCurrentTime} total={audioDuration} />
      </div>

      <div className="w-full p-2 mb-4 border rounded">
        {isReading || wordTimestamps.length > 0 ? renderHighlightedText() : section.paragraph_content}
      </div>

      <button
        className={`py-2 px-4 rounded mr-2 ${
          isReading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={readText}
        disabled={isReading}
      >
        {isReading ? "Reading..." : "Read Aloud"}
      </button>

      <audio ref={audioRef} className="hidden" />
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
