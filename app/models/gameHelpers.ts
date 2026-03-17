import type { TypingWord, Difficulties } from "~/models/typingTypes";
import { WORD_BANKS } from "./wordbanks";


const ACTIVE_WORD_OBJ = { text: "", state: "active", typed: "" } as TypingWord;
const WORD_OBJ = { text: "", state: "pending", typed: "" } as TypingWord;

/** Calculates the percentage of correctly completed words. */
export function calculateAccuracy({
    words,
}: {
    words: TypingWord[];
}) {
    const numberCorrect = words.filter((word) => word.status === "correct").length;
    const numberTyped =
        words.filter((word) => word.status === "incorrect").length + numberCorrect;

    const percentage = Math.floor((numberCorrect / numberTyped) * 100);
    if (Number.isNaN(percentage)) {
        return 0;
    } else {
        return percentage;
    }
}

/** Calculates words per minute from correct words and elapsed time. */
export function calculateWpm({
    words,
    timeInSeconds,
}: {
    words: TypingWord[];
    timeInSeconds: number;
}) {
    const minutes = timeInSeconds / 60;
    const correctWords = words.filter((word) => word.status === "correct").length;
    const res = Math.floor(correctWords / minutes);
    if (!Number.isFinite(res) || Number.isNaN(res)) {
        return 0;
    } else {
        return res;
    }
}

/** Converts a list of raw words into tracked typing word objects. */
function buildTypingWordsArr(
    shuffledWords: string[],
) {
    let next: TypingWord[] = [];
    for (let i = 0; i < shuffledWords.length; i++) {
        if (i === 0) {
            const wordObj = ACTIVE_WORD_OBJ;
            next.push({ ...wordObj, text: shuffledWords[i] });
        } else {
            const wordObj = WORD_OBJ;
            next.push({ ...wordObj, text: shuffledWords[i] });
        }
    }

    return next;
}

/** Returns the word bank for the requested difficulty. */
function chooseWords(
    difficulty: Difficulties
) {
    return WORD_BANKS[difficulty] as readonly string[];
}

/** Returns a shuffled copy of the provided word list. */
function shuffle(words: readonly string[]) {
    const shuffledWords = [...words];

    for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]]
    }

    return shuffledWords;
}

/** Builds the randomized typing queue for a game round. */
export function getTypingWords(
    difficulty: Difficulties
) {
    const rawWords = chooseWords(difficulty);
    const shuffled = shuffle(rawWords);
    return buildTypingWordsArr(shuffled);
}
