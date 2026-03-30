export type TypingWord = {
    text: string;
    state: "pending" | "active";
    status?: "correct" | "incorrect";
    typed?: string;
};

export type PlayerGameStats = {
    wpm: number;
    accuracy: number;
    timeInSeconds: number;
};

export type Difficulties = "easy" | "medium" | "hard";
