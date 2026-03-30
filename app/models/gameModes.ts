export type GameMode = "time" | "instant-fail";

export type GameModeOption = {
    id: GameMode;
    label: string;
    description: string;
    tag: string;
};

export const GAME_MODES = [
    {
        id: "time",
        label: "TIME",
        description: "At timeout, the slowest players are eliminated.",
        tag: "SURVIVE THE CLOCK",
    },
    {
        id: "instant-fail",
        label: "INSTANT FAIL",
        description: "One mistake and you're out.",
        tag: "ZERO MARGIN",
    },
] as const satisfies readonly GameModeOption[];
