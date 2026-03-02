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
