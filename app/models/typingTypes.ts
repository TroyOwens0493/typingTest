export type TypingWord = {
    text: string;
    state: "pending" | "active";
    status?: "correct" | "incorrect";
    typed?: string;
};

export type Difficulties = "easy" | "medium" | "hard";
