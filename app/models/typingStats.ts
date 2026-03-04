import type { TypingWord } from "~/models/typingTypes";

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

export function calculateWpm({
    numberOfWords,
    timeInSeconds
}: {
    numberOfWords: number,
    timeInSeconds: number
}) {
    const minutes = timeInSeconds / 60;
    const res = Math.floor(numberOfWords / minutes);
    if (!Number.isFinite(res) || Number.isNaN(res)) {
        return 0;
    } else {
        return res;
    }
}
