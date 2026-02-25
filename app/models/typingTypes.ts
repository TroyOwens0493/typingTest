export type TypingWord = {
    text: string;
    state: "correct" | "incorrect" | "pending" | "active";
    typed?: string;
};
