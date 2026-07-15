import type { PlayerGameStats, TypingWord } from "./typingTypes";

/** Calculates a player's stats from completed words using standard five-character WPM. */
export function calculatePlayerStats(
    words: Pick<TypingWord, "text" | "status">[],
    timeInSeconds: number,
): PlayerGameStats {
    const evaluatedWords = words.filter((word) => word.status !== undefined);
    const correctCharacters = evaluatedWords.reduce(
        (total, word) => total + (word.status === "correct" ? word.text.length : 0),
        0,
    );
    const totalCharacters = evaluatedWords.reduce(
        (total, word) => total + word.text.length,
        0,
    );

    return {
        wpm:
            timeInSeconds > 0
                ? Math.round(correctCharacters / 5 / (timeInSeconds / 60))
                : 0,
        accuracy:
            totalCharacters > 0
                ? Math.round((correctCharacters / totalCharacters) * 100)
                : 0,
        timeInSeconds,
    };
}
