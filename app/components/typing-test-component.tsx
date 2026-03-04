import { useState, useEffect, useCallback } from "react";
import { calculateAccuracy, calculateWpm } from "~/models/typingStats";
import type { TypingWord } from "~/models/typingTypes";

function ActiveWord({
    text,
    typed,
    isIncorrect,
}: {
    text: string;
    typed: string;
    isIncorrect: boolean;
}) {
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
                                    ? isIncorrect
                                        ? "text-red-400"
                                        : "text-white"
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
    status,
    typed,
}: {
    text: TypingWord["text"];
    state: TypingWord["state"];
    status?: TypingWord["status"];
    typed?: string;
}) {
    if (state === "active" && typed !== undefined) {
        return (
            <ActiveWord
                text={text}
                typed={typed}
                isIncorrect={status === "incorrect"}
            />
        );
    }

    const stateStyles = {
        correct: "text-neutral-500",
        incorrect: "text-red-400/90 decoration-red-400/40 underline underline-offset-4",
        active: "text-white",
        pending: "text-neutral-700",
    };

    if (status) {
        return <span className={stateStyles[status]}>{text}</span>;
    }

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

type TypingTestComponentProps = {
    words: TypingWord[];
};

export function TypingTestComponent({ words }: TypingTestComponentProps) {
    const [isFocused, setIsFocused] = useState(true);
    const [typed, setTyped] = useState("");
    const [startTime, setStartTime] = useState<number>(0);
    const [timerInSeconds, setTimerInSeconds] = useState(0);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [activeWords, setActiveWords] = useState(words);

    const getSetWords = useCallback((eventValue: string) => {
        setTyped((prev) => {
            let nextTyped = prev;

            if (eventValue === "Backspace") {
                nextTyped = prev.slice(0, -1);
            } else if (eventValue.length === 1) {
                const isWhitespace = eventValue.trim().length === 0;

                // Ignore leading whitespace: do not start the timer or modify typed text
                if (prev === "" && isWhitespace) {
                    return prev;
                }

                if (prev === "" && startTime === 0 && !isWhitespace) {
                    setStartTime(Date.now());
                }
                nextTyped = `${prev}${eventValue}`;
            }

            setActiveWords((currentWords) => {
                const typedArr = nextTyped.split(" ");
                const activeIndex = Math.max(0, typedArr.length - 1);
                setWordsTyped(activeIndex + 1);

                if (activeIndex >= currentWords.length) {
                    return currentWords;
                }

                return currentWords.map((word, index) => {
                    const wordTyped = typedArr[index] ?? "";

                    if (index === activeIndex) {
                        const isCorrectSoFar = word.text.startsWith(wordTyped);
                        return {
                            ...word,
                            typed: wordTyped,
                            state: "active",
                            status: isCorrectSoFar ? undefined : "incorrect",
                        };
                    }

                    if (index < activeIndex) {
                        return {
                            ...word,
                            typed: wordTyped,
                            state: "pending",
                            status: wordTyped === word.text ? "correct" : "incorrect",
                        };
                    }

                    return { ...word, typed: wordTyped, state: "pending", status: undefined };
                });
            });

            return nextTyped;
        });
    }, [startTime]);

    useEffect(() => {
        setActiveWords(words);
    }, [words]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            getSetWords(e.key);
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [getSetWords]);

    useEffect(() => {
        if (startTime === 0) return;
        const id = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            setTimerInSeconds(elapsedSeconds);
        }, 1000);
        return () => clearInterval(id);
    }, [startTime]);

    return (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 lg:px-12">
            <div className="mb-10 flex items-center gap-12">
                <StatBlock
                    label="WPM"
                    value={`${calculateWpm({
                        numberOfWords: wordsTyped,
                        timeInSeconds: timerInSeconds,
                    })}`}
                    accent
                />
                <div className="h-4 w-px bg-neutral-800" />
                <StatBlock
                    label="ACC"
                    value={`${calculateAccuracy({
                        words: activeWords.filter((word) => word.state !== "active"),
                    })}%`}
                />
                <div className="h-4 w-px bg-neutral-800" />
                <StatBlock
                    label="TIME"
                    value={`${timerInSeconds}`}
                    accent
                />
            </div>

            {/* eslint-disable-next-line */}
            <div className="relative w-full max-w-3xl cursor-text">
                {!isFocused && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[3px]">
                        <span className="text-[11px] tracking-[0.2em] text-neutral-500">
                            CLICK TO FOCUS
                        </span>
                    </div>
                )}

                <div
                    className={`flex flex-wrap gap-x-[0.65em] gap-y-3 text-[1.35rem] leading-relaxed transition-all duration-200 ${!isFocused ? "opacity-30" : ""
                        }`}
                >
                    {activeWords.map((word, i) => (
                        <Word
                            key={`${word.text}-${i}`}
                            text={word.text}
                            state={word.state}
                            status={word.status}
                            typed={word.typed}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-14 flex flex-col items-center gap-3">
                <button
                    type="button"
                    className="group flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-400"
                    onClick={() => { /* restart logic */ }}
                >
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
    );
}
