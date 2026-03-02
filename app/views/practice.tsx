import { useState, useEffect, type Dispatch, type SetStateAction, useMemo } from "react";
import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import { calculateAccuracy } from "~/models/typingStats";
import type { TypingWord } from "~/models/typingTypes";

/*
 * Sample words for the typing area.
 * Each word has a visual state for the static mockup:
 *   "correct"   — typed correctly (dimmed)
 *   "incorrect" — typed with errors (red)
 *   "active"    — currently being typed (white, with per-char progress)
 *   "pending"   — not yet reached (very dim)
 */
const Words = [
    // Row of already-typed words
    { text: "the", state: "active", typed: "" },
    { text: "quick", state: "pending", typed: "" },
    { text: "brown", state: "pending", typed: "" },
    { text: "fox", state: "pending", typed: "" },
    { text: "jumps", state: "pending", typed: "" },
    { text: "over", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "lazy", state: "pending", typed: "" },
    { text: "dog", state: "pending", typed: "" },
    { text: "while", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "bright", state: "pending", typed: "" },
    { text: "sun", state: "pending", typed: "" },
    { text: "sets", state: "pending", typed: "" },
    { text: "behind", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "distant", state: "pending", typed: "" },
    { text: "mountains", state: "pending", typed: "" },
    { text: "casting", state: "pending", typed: "" },
    { text: "long", state: "pending", typed: "" },
    { text: "shadows", state: "pending", typed: "" },
    { text: "across", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "valley", state: "pending", typed: "" },
    { text: "below", state: "pending", typed: "" },
    { text: "where", state: "pending", typed: "" },
    { text: "rivers", state: "pending", typed: "" },
    { text: "wind", state: "pending", typed: "" },
    { text: "through", state: "pending", typed: "" },
    { text: "ancient", state: "pending", typed: "" },
    { text: "forests", state: "pending", typed: "" },
    { text: "and", state: "pending", typed: "" },
    { text: "forgotten", state: "pending", typed: "" },
    { text: "trails", state: "pending", typed: "" },
    { text: "lead", state: "pending", typed: "" },
    { text: "nowhere", state: "pending", typed: "" },
    { text: "in", state: "pending", typed: "" },
    { text: "particular", state: "pending", typed: "" },
    { text: "just", state: "pending", typed: "" },
    { text: "deeper", state: "pending", typed: "" },
    { text: "into", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "unknown", state: "pending", typed: "" },
] as TypingWord[];

function ActiveWord({ text, typed }: { text: string; typed: string }) {
    const chars = text.split("");
    return (
        <span className="relative">
            {chars.map((char, charIndex) => {
                const isTyped = charIndex < typed.length;
                const isCursor = charIndex === typed.length;
                const charKey = `char-${text}-${charIndex}`;
                return (
                    // biome-ignore lint: stable list of characters from static text
                    <span key={charKey} className="relative">
                        {isCursor && (
                            <span className="absolute left-0 top-0 h-full w-[2px] bg-lime animate-blink" />
                        )}
                        <span
                            className={
                                isTyped
                                    ? "text-white"
                                    : "text-neutral-600"
                            }
                        >
                            {char}
                        </span>
                    </span>
                );
            })}
        </span>
    );
}

function Word({
    text,
    state,
    typed,
}: {
    text: TypingWord["text"];
    state: TypingWord["state"] | "active";
    typed?: string;
}) {
    if (state === "active" && typed !== undefined) {
        return <ActiveWord text={text} typed={typed} />;
    }

    const stateStyles = {
        correct: "text-neutral-500",
        incorrect: "text-red-400/90 decoration-red-400/40 underline underline-offset-4",
        active: "text-white",
        pending: "text-neutral-700",
    };

    return <span className={stateStyles[state]}>{text}</span>;
}

function StatBlock({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] tracking-[0.3em] text-neutral-700">
                {label}
            </span>
            <span
                className={`text-lg font-medium tabular-nums tracking-tight ${accent ? "text-lime" : "text-neutral-400"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}


export function Practice() {
    const [isFocused, setIsFocused] = useState(true);
    const [words, setWords] = useState(Words);
    const [typed, setTyped] = useState("");

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            getInput(e.key, setWords);
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function getInput(eventValue: string) {
        //console.log(eventValue);

        if (eventValue === "Backspace") {
            setTyped((prev) => prev.slice(0, -1));
            return;
        }

        if (eventValue.length === 1) {
            setTyped((prev) => `${prev}${eventValue}`);
        }
    }

    useEffect(() => {
        console.log(typed);
    }, [typed]);

    useEffect(() => {
        console.log("words", words);
    }, [words]);


    return (
        <main className="relative flex h-screen flex-col overflow-hidden bg-[#050505] font-mono text-neutral-400">
            {/* Scanline texture overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                }}
            />

            {/* Nav */}
            <Nav />

            {/* Main content — vertically centered */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 lg:px-12">

                {/* Live stats — above the text */}
                <div className="mb-10 flex items-center gap-12">
                    <StatBlock label="WPM" value="72" accent />
                    <div className="h-4 w-px bg-neutral-800" />
                    <StatBlock
                        label="ACC"
                        value={`${calculateAccuracy({
                            words: words.filter((word) => word.state !== "active"),
                        })}%`}
                    />
                    <div className="h-4 w-px bg-neutral-800" />
                    <StatBlock label="TIME" value="18" accent />
                </div>

                {/* Typing area */}
                {/* eslint-disable-next-line */}
                <div className="relative w-full max-w-3xl cursor-text">
                    {/* Unfocused overlay */}
                    {!isFocused && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[3px]">
                            <span className="text-[11px] tracking-[0.2em] text-neutral-500">
                                CLICK TO FOCUS
                            </span>
                        </div>
                    )}

                    {/* Words */}
                    <div
                        className={`flex flex-wrap gap-x-[0.65em] gap-y-3 text-[1.35rem] leading-relaxed transition-all duration-200 ${!isFocused ? "opacity-30" : ""
                            }`}
                    >
                        {words.map((word, i) => (
                            <Word
                                key={`${word.text}-${i}`}
                                text={word.text}
                                state={word.state}
                                typed={"typed" in word ? word.typed : undefined}
                            />
                        ))}
                    </div>
                </div>

                {/* Restart prompt */}
                <div className="mt-14 flex flex-col items-center gap-3">
                    <button
                        type="button"
                        className="group flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-400"
                        onClick={() => {/* restart logic */ }}
                    >
                        {/* Restart icon */}
                        <svg
                            className="h-3.5 w-3.5 transition-transform group-hover:rotate-[-45deg]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 2v6h-6" />
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M3 22v-6h6" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                        <span className="text-[10px] tracking-[0.3em]">
                            RESTART
                        </span>
                    </button>
                    <span className="text-[9px] tracking-[0.2em] text-neutral-800">
                        TAB + ENTER
                    </span>
                </div>
            </div>

            <Footer label="PRACTICE" />
        </main>
    );
}
