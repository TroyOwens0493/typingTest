export type TypingWord = {
    text: string;
    state: "pending" | "active";
    status?: "correct" | "incorrect";
    typed?: string;
};
