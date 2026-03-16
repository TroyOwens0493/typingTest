export type GameMode = "elimination" | "points" | "instant-fail";

export type GameModeOption = {
    id: GameMode;
    label: string;
    description: string;
    tag: string;
};

export const GAME_MODES = [
    {
        id: "elimination",
        label: "ELIM",
        description: "Players are eliminated each round until one remains.",
        tag: "LAST ONE STANDING",
    },
    {
        id: "points",
        label: "POINTS",
        description: "Earn points for speed and accuracy across rounds.",
        tag: "HIGHEST SCORE WINS",
    },
    {
        id: "instant-fail",
        label: "INSTANT FAIL",
        description: "One mistake and you're out.",
        tag: "ZERO MARGIN",
    },
] as const satisfies readonly GameModeOption[];
