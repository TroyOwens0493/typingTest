import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { calculateAccuracy, calculateWpm } from "~/models/gameHelpers";
import type { PlayerGameStats, TypingWord } from "~/models/typingTypes";

// Renders the active word with a blinking cursor and per-character styling.
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

// Renders a word based on its typing state and status.
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

// Displays a labeled stat value (WPM/ACC/TIME).
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
    unfocusedMessage?: string;
    /** When false, focus can only be changed by the unfocusedMessage prop, not by user interaction (click/Enter) */
    allowFocusChange?: boolean;
    /** Optional external timer start timestamp (ms since epoch), used for synchronized match timers. */
    timerStartTime?: number;
    /** Enables elimination on the first typing mistake. */
    instantFailEnabled?: boolean;
    /** Called once when the player gets eliminated. */
    onEliminated?: (stats: PlayerGameStats) => Promise<void> | void;
    /** Called when the player completes a word and the active word advances. */
    onWordBoundary?: (words: TypingWord[]) => Promise<void> | void;
    /** Existing elimination result to restore from match state. */
    initialEliminatedStats?: PlayerGameStats;
};

const VISIBLE_LINE_COUNT = 5;

/** Estimates how many words fit on each visible line for the typing viewport. */
function getVisibleWordWindow(words: TypingWord[], activeIndex: number) {
    const averageCharactersPerLine = 26;
    const wordsPerLine = Math.max(
        1,
        Math.floor(
            averageCharactersPerLine /
                Math.max(
                    1,
                    words.reduce((total, word) => total + word.text.length, 0) /
                        Math.max(words.length, 1),
                ),
        ),
    );
    const wordsPerPage = Math.max(1, wordsPerLine * VISIBLE_LINE_COUNT);
    const windowStart = Math.floor(activeIndex / wordsPerPage) * wordsPerPage;
    const windowEnd = Math.min(words.length, windowStart + wordsPerPage);

    return {
        start: windowStart,
        end: windowEnd,
    };
}

/** Builds a stats snapshot from the current typed value and elapsed time. */
function getStatsSnapshot(
    words: TypingWord[],
    typedValue: string,
    elapsedSeconds: number,
) {
    const typedArr = typedValue.split(" ");
    const activeIndex = Math.max(0, typedArr.length - 1);

    const evaluatedWords: TypingWord[] = words.slice(0, activeIndex).map((word, index) => {
        const typedWord = typedArr[index] ?? "";
        const status: TypingWord["status"] =
            typedWord === word.text ? "correct" : "incorrect";

        return {
            ...word,
            typed: typedWord,
            status,
            state: "pending",
        };
    });

    const activeWord = words[activeIndex];
    const activeTyped = typedArr[activeIndex] ?? "";

    if (activeWord && activeTyped.length > 0) {
        evaluatedWords.push({
            ...activeWord,
            typed: activeTyped,
            status: "incorrect",
            state: "pending",
        });
    }

    return {
        wpm: calculateWpm({
            words: evaluatedWords,
            timeInSeconds: elapsedSeconds,
        }),
        accuracy: calculateAccuracy({
            words: evaluatedWords,
        }),
        timeInSeconds: elapsedSeconds,
    };
}

export function TypingTestComponent({
    words,
    unfocusedMessage,
    allowFocusChange = true,
    timerStartTime,
    instantFailEnabled = false,
    onEliminated,
    onWordBoundary,
    initialEliminatedStats,
}: TypingTestComponentProps) {
    // Tracks whether the typing surface is focused for input.
    // If unfocusedMessage is provided, start unfocused.
    const [isFocused, setIsFocused] = useState(!unfocusedMessage);
    // Stores the full raw typed string (including spaces).
    const [typed, setTyped] = useState("");
    // Timestamp (ms) when typing starts; 0 means not started yet.
    const [startTime, setStartTime] = useState<number>(0);
    // Elapsed time in seconds since typing started.
    const [timerInSeconds, setTimerInSeconds] = useState(0);
    // Count of words progressed through, used for WPM calculation.
    const [wordsTyped, setWordsTyped] = useState(0);
    // Working copy of words with typing state/status applied.
    const [activeWords, setActiveWords] = useState(words);
    // Whether the typing test has been completed.
    const [isComplete, setIsComplete] = useState(false);
    // Whether the player has been eliminated by instant-fail rules.
    const [isEliminated, setIsEliminated] = useState(false);
    // Cached stats to display after elimination.
    const [eliminatedStats, setEliminatedStats] = useState<PlayerGameStats | undefined>(
        initialEliminatedStats,
    );
    const hasReportedElimination = useRef(Boolean(initialEliminatedStats));
    const lastSyncedWordIndex = useRef(0);
    // Effective timer start timestamp, preferring external match start time when provided.
    const effectiveStartTime = timerStartTime ?? startTime;

    // Keep focus state in sync with external unfocused message changes.
    useEffect(() => {
        setIsFocused(!unfocusedMessage);
    }, [unfocusedMessage]);

    /** Derives the currently active word index from the rendered typing state. */
    const activeWordIndex = useMemo(() => {
        const foundIndex = activeWords.findIndex((word) => word.state === "active");

        if (foundIndex >= 0) {
            return foundIndex;
        }

        return Math.max(0, Math.min(wordsTyped - 1, activeWords.length - 1));
    }, [activeWords, wordsTyped]);

    /** Limits the rendered words to a five-line viewport around the active word. */
    const visibleWords = useMemo(() => {
        const { start, end } = getVisibleWordWindow(activeWords, activeWordIndex);

        return activeWords.slice(start, end).map((word, index) => ({
            word,
            absoluteIndex: start + index,
        }));
    }, [activeWords, activeWordIndex]);

    const resetTypingState = useCallback(() => {
        setTyped("");
        setStartTime(0);
        setTimerInSeconds(0);
        setWordsTyped(0);
        setActiveWords(words);
        setIsComplete(false);
        setIsEliminated(false);
        setEliminatedStats(undefined);
        hasReportedElimination.current = false;
        lastSyncedWordIndex.current = 0;
        setIsFocused(true);
    }, [words]);

    // Handles key input, updates typed string, and starts timer on first character.
    const getSetWords = useCallback((eventValue: string) => {
        if (eventValue === "Enter" && allowFocusChange) {
            resetTypingState();
            return;
        }

        if (!isFocused || isComplete || isEliminated) return;
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

                if (prev === "" && startTime === 0 && timerStartTime === undefined && !isWhitespace) {
                    setStartTime(Date.now());
                }
                nextTyped = `${prev}${eventValue}`;

                if (instantFailEnabled) {
                    const typedArr = nextTyped.split(" ");
                    const activeIndex = Math.max(0, typedArr.length - 1);
                    const activeWord = activeWords[activeIndex];
                    const activeTyped = typedArr[activeIndex] ?? "";

                    if (activeWord && !activeWord.text.startsWith(activeTyped)) {
                        const elapsedSeconds =
                            effectiveStartTime > 0
                                ? Math.max(0, Math.floor((Date.now() - effectiveStartTime) / 1000))
                                : 0;
                        const stats = getStatsSnapshot(activeWords, nextTyped, elapsedSeconds);

                        setTimerInSeconds(elapsedSeconds);
                        setEliminatedStats(stats);
                        setIsEliminated(true);
                        setIsComplete(true);
                        setIsFocused(false);

                        if (!hasReportedElimination.current) {
                            hasReportedElimination.current = true;
                            void Promise.resolve(onEliminated?.(stats));
                        }
                    }
                }
            }
            return nextTyped;
        });
    }, [
        isFocused,
        isComplete,
        isEliminated,
        startTime,
        resetTypingState,
        allowFocusChange,
        timerStartTime,
        instantFailEnabled,
        activeWords,
        effectiveStartTime,
        onEliminated,
    ]);

    // Recompute word states whenever typed input changes.
    useEffect(() => {
        setActiveWords((currentWords) => {
            const typedArr = typed.split(" ");
            const activeIndex = Math.max(0, typedArr.length - 1);
            setWordsTyped(activeIndex + 1);

            const lastWordIndex = currentWords.length - 1;
            const lastTyped = typedArr[lastWordIndex] ?? "";
            const extraTyped = typedArr.slice(currentWords.length).some((value) => value !== "");
            const isTestComplete =
                lastWordIndex >= 0 &&
                lastTyped === currentWords[lastWordIndex]?.text &&
                !extraTyped;

            if (isTestComplete) {
                setIsComplete(true);
                setIsFocused(false);
            }

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
    }, [typed]);

    /** Persists the player's latest state whenever they advance to a new word. */
    useEffect(() => {
        if (!onWordBoundary || isComplete || isEliminated) {
            return;
        }

        const completedWordCount = activeWords.filter((word) => word.status !== undefined).length;

        if (completedWordCount <= lastSyncedWordIndex.current) {
            return;
        }

        lastSyncedWordIndex.current = completedWordCount;
        void Promise.resolve(onWordBoundary(activeWords));
    }, [activeWords, isComplete, isEliminated, onWordBoundary]);

    // Refresh active words when the word list prop changes.
    useEffect(() => {
        setActiveWords(words);
        setIsComplete(false);
        lastSyncedWordIndex.current = words.filter((word) => word.status !== undefined).length;
    }, [words]);

    // Restores elimination state from persisted match data.
    useEffect(() => {
        if (!initialEliminatedStats) {
            return;
        }

        setEliminatedStats(initialEliminatedStats);
        setTimerInSeconds(initialEliminatedStats.timeInSeconds);
        setIsEliminated(true);
        setIsComplete(true);
        setIsFocused(false);
        hasReportedElimination.current = true;
    }, [initialEliminatedStats]);

    // Recompute displayed elapsed time when using an external synchronized timer.
    useEffect(() => {
        if (timerStartTime === undefined || isComplete) {
            return;
        }

        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timerStartTime) / 1000));
        setTimerInSeconds(elapsedSeconds);
    }, [timerStartTime, isComplete]);

    // Register global keydown handler for typing input.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter" && allowFocusChange) {
                resetTypingState();
                return;
            }
            if (!isFocused || isComplete || isEliminated) return;
            getSetWords(e.key);
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [getSetWords, isFocused, isComplete, isEliminated, resetTypingState, allowFocusChange]);

    // Start/stop the interval that updates elapsed time.
    useEffect(() => {
        if (effectiveStartTime === 0 || isComplete) return;
        const id = setInterval(() => {
            const elapsedSeconds = Math.max(0, Math.floor((Date.now() - effectiveStartTime) / 1000));
            setTimerInSeconds(elapsedSeconds);
        }, 1000);
        return () => clearInterval(id);
    }, [effectiveStartTime, isComplete]);

    return (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 lg:px-12">
            <div className="mb-10 flex items-center gap-12">
                <StatBlock
                    label="WPM"
                    value={`${calculateWpm({
                        words: activeWords.filter((word) => word.state !== "active"),
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
            <button
                type="button"
                className="relative w-full max-w-3xl cursor-text text-left"
                onClick={() => {
                    if (allowFocusChange && !isComplete) setIsFocused(true);
                }}
            >
                {!isFocused && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[3px]">
                        {isEliminated && eliminatedStats ? (
                            <div className="w-full max-w-lg border border-red-400/30 bg-black/80 p-6">
                                <p className="text-center text-xs tracking-[0.25em] text-red-400">
                                    ELIMINATED
                                </p>
                                <p className="mt-2 text-center text-[10px] tracking-[0.15em] text-neutral-500">
                                    YOU MADE A MISTAKE IN INSTANT FAIL MODE
                                </p>
                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    <div className="border border-neutral-800/80 p-3 text-center">
                                        <p className="text-[9px] tracking-[0.2em] text-neutral-600">WPM</p>
                                        <p className="mt-1 text-lg tabular-nums text-lime">
                                            {eliminatedStats.wpm}
                                        </p>
                                    </div>
                                    <div className="border border-neutral-800/80 p-3 text-center">
                                        <p className="text-[9px] tracking-[0.2em] text-neutral-600">ACC</p>
                                        <p className="mt-1 text-lg tabular-nums text-neutral-200">
                                            {eliminatedStats.accuracy}%
                                        </p>
                                    </div>
                                    <div className="border border-neutral-800/80 p-3 text-center">
                                        <p className="text-[9px] tracking-[0.2em] text-neutral-600">TIME</p>
                                        <p className="mt-1 text-lg tabular-nums text-neutral-200">
                                            {eliminatedStats.timeInSeconds}s
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : unfocusedMessage ? (
                            // Custom unfocused message (e.g., waiting for round to start)
                            <div className="flex items-center gap-2 text-neutral-500">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                                <span className="text-[11px] tracking-[0.2em]">
                                    {unfocusedMessage}
                                </span>
                            </div>
                        ) : (
                            // Default restart button
                            <button
                                type="button"
                                className="group flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-400"
                                onClick={resetTypingState}
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
                                <span className="text-[11px] tracking-[0.2em] text-neutral-500">
                                    CLICK OR PRESS ENTER TO RESTART
                                </span>
                            </button>
                        )}
                    </div>
                )}

                <div
                    className={`h-[calc(1.35rem*1.625*5)] overflow-hidden flex flex-wrap content-start gap-x-[0.65em] gap-y-3 text-[1.35rem] leading-relaxed transition-all duration-200 ${!isFocused ? "opacity-30" : ""
                        }`}
                >
                    {visibleWords.map(({ word, absoluteIndex }) => (
                        <Word
                            key={`${word.text}-${absoluteIndex}`}
                            text={word.text}
                            state={word.state}
                            status={word.status}
                            typed={word.typed}
                        />
                    ))}
                </div>
            </button>
            {allowFocusChange && (
                <div className="mt-14 flex flex-col items-center gap-3">
                    <button
                        type="button"
                        className="group flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-400"
                        onClick={resetTypingState}
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
                        ENTER
                    </span>
                </div>
            )}
        </div>
    );
}
