import { useState } from "react";
import { Nav } from "~/components/nav";
import { Panel } from "~/components/panel";

/* ─── Game Mode Definitions ─── */
const GAME_MODES = [
    {
        id: "elimination" as const,
        label: "ELIM",
        description: "Players are eliminated each round until one remains.",
        tag: "LAST ONE STANDING",
    },
    {
        id: "points" as const,
        label: "POINTS",
        description: "Earn points for speed and accuracy across rounds.",
        tag: "HIGHEST SCORE WINS",
    },
    {
        id: "instant-fail" as const,
        label: "INSTANT FAIL",
        description: "One mistake and you're out.",
        tag: "ZERO MARGIN",
    },
] as const;

type GameMode = (typeof GAME_MODES)[number]["id"];
type Difficulty = "easy" | "medium" | "hard";
type Visibility = "private" | "public";

/* ─── Mode Card ─── */
function ModeCard({
    mode,
    selected,
    onSelect,
}: {
    mode: (typeof GAME_MODES)[number];
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`group relative border text-left transition-all ${selected
                ? "border-lime bg-lime-faint"
                : "border-neutral-800/80 bg-[#0a0a0a] hover:border-neutral-700"
                }`}
        >
            {/* Selection indicator */}
            <div className="absolute right-3 top-3">
                <span
                    className={`inline-block h-2 w-2 rounded-full border transition-all ${selected
                        ? "border-lime bg-lime shadow-[0_0_6px_rgba(190,255,0,0.4)]"
                        : "border-neutral-700 bg-transparent"
                        }`}
                />
            </div>

            <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
                <span
                    className={`text-[9px] tracking-[0.3em] ${selected ? "text-lime" : "text-neutral-700"
                        }`}
                >
                    {mode.tag}
                </span>
                <p
                    className={`mt-2 font-display text-lg font-bold tracking-tight sm:text-xl ${selected ? "text-white" : "text-neutral-500"
                        }`}
                >
                    {mode.label}
                </p>
                <p
                    className={`mt-2 text-[11px] leading-relaxed sm:text-xs ${selected ? "text-neutral-400" : "text-neutral-700"
                        }`}
                >
                    {mode.description}
                </p>
            </div>
        </button>
    );
}

/* ─── Toggle Group ─── */
function ToggleGroup<T extends string>({
    options,
    value,
    onChange,
}: {
    options: { id: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex">
            {options.map((opt, i) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    className={`relative px-5 py-3 text-[10px] font-medium tracking-[0.2em] transition-all sm:px-6 sm:text-[11px] ${i === 0
                        ? "border border-r-0"
                        : i === options.length - 1
                            ? "border border-l-0"
                            : "border-y border-r-0"
                        } ${value === opt.id
                            ? "bg-lime text-black border-lime z-10"
                            : "border-neutral-800/80 bg-[#0a0a0a] text-neutral-600 hover:text-neutral-400"
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

/* ─── Player Count Stepper ─── */
function PlayerStepper({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    const min = 2;
    const max = 50;
    const markers = [2, 10, 25, 50];

    function clamp(n: number) {
        return Math.max(min, Math.min(max, n));
    }

    return (
        <div>
            <div className="flex items-center gap-4">
                {/* Decrement */}
                <button
                    type="button"
                    onClick={() => onChange(clamp(value - 1))}
                    disabled={value <= min}
                    className="flex h-10 w-10 items-center justify-center border border-neutral-800/80 bg-[#0a0a0a] text-sm text-neutral-500 transition-all hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-800 disabled:hover:border-neutral-800/80 sm:h-11 sm:w-11"
                >
                    -
                </button>

                {/* Value display */}
                <div className="flex min-w-[5rem] flex-col items-center sm:min-w-[6rem]">
                    <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-lime sm:text-4xl">
                        {value}
                    </span>
                    <span className="mt-1 text-[9px] tracking-[0.3em] text-neutral-700">
                        PLAYERS MAX
                    </span>
                </div>

                {/* Increment */}
                <button
                    type="button"
                    onClick={() => onChange(clamp(value + 1))}
                    disabled={value >= max}
                    className="flex h-10 w-10 items-center justify-center border border-neutral-800/80 bg-[#0a0a0a] text-sm text-neutral-500 transition-all hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-800 disabled:hover:border-neutral-800/80 sm:h-11 sm:w-11"
                >
                    +
                </button>
            </div>

            {/* Marker track */}
            <div className="relative mt-5 h-px w-full bg-neutral-800/60">
                {markers.map((m) => {
                    const pct = ((m - min) / (max - min)) * 100;
                    return (
                        <button
                            key={m}
                            type="button"
                            onClick={() => onChange(m)}
                            className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${pct}%` }}
                        >
                            <span
                                className={`block h-2 w-2 rounded-full border transition-all ${value === m
                                    ? "border-lime bg-lime"
                                    : "border-neutral-700 bg-neutral-900 group-hover:border-neutral-500"
                                    }`}
                            />
                            <span
                                className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 text-[9px] tabular-nums tracking-[0.15em] transition-colors ${value === m
                                    ? "text-lime"
                                    : "text-neutral-700 group-hover:text-neutral-500"
                                    }`}
                            >
                                {m}
                            </span>
                        </button>
                    );
                })}

                {/* Progress fill */}
                <div
                    className="absolute left-0 top-0 h-full bg-lime/20"
                    style={{
                        width: `${((value - min) / (max - min)) * 100}%`,
                    }}
                />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   CREATE MATCH VIEW
   ═══════════════════════════════════════════════════════ */
export function Create() {
    const [gameMode, setGameMode] = useState<GameMode>("elimination");
    const [playerCount, setPlayerCount] = useState(8);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [visibility, setVisibility] = useState<Visibility>("private");

    const selectedMode = GAME_MODES.find((m) => m.id === gameMode)!;

    return (
        <main className="relative flex min-h-screen flex-col bg-[#050505] font-mono text-neutral-400">
            {/* Scanline texture overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                }}
            />

            {/* Nav */}
            <Nav />

            {/* ─── Content ─── */}
            <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-10 lg:px-12 lg:pt-16">
                {/* Page header */}
                <div className="mb-12">
                    <p className="mb-4 text-[11px] tracking-[0.3em] text-lime">
                        &gt; CREATE MATCH
                        <span className="animate-blink">_</span>
                    </p>

                    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-tight text-white">
                        New Arena
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                        Configure your match and share the lobby code with
                        friends.
                    </p>
                </div>

                {/* ─── Two-column layout ─── */}
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
                    {/* ──── Left: Configuration Form ──── */}
                    <div className="space-y-12">
                        {/* Game Mode */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                GAME MODE
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {GAME_MODES.map((mode) => (
                                    <ModeCard
                                        key={mode.id}
                                        mode={mode}
                                        selected={gameMode === mode.id}
                                        onSelect={() => setGameMode(mode.id)}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Player Count */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                PLAYER COUNT
                            </p>
                            <PlayerStepper
                                value={playerCount}
                                onChange={setPlayerCount}
                            />
                        </section>

                        {/* Text Difficulty */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                TEXT DIFFICULTY
                            </p>
                            <ToggleGroup
                                options={[
                                    { id: "easy" as Difficulty, label: "EASY" },
                                    {
                                        id: "medium" as Difficulty,
                                        label: "MEDIUM",
                                    },
                                    { id: "hard" as Difficulty, label: "HARD" },
                                ]}
                                value={difficulty}
                                onChange={setDifficulty}
                            />
                            <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-700">
                                {difficulty === "easy" &&
                                    "// common words, shorter sentences"}
                                {difficulty === "medium" &&
                                    "// mixed vocabulary, standard length"}
                                {difficulty === "hard" &&
                                    "// complex words, punctuation heavy"}
                            </p>
                        </section>

                        {/* Lobby Visibility */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                LOBBY VISIBILITY
                            </p>
                            <ToggleGroup
                                options={[
                                    {
                                        id: "private" as Visibility,
                                        label: "\u25CB  PRIVATE",
                                    },
                                    {
                                        id: "public" as Visibility,
                                        label: "\u25CB  PUBLIC",
                                    },
                                ]}
                                value={visibility}
                                onChange={setVisibility}
                            />
                            <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-700">
                                {visibility === "private"
                                    ? "// invite only \u2014 share the lobby code"
                                    : "// anyone can find and join this match"}
                            </p>
                        </section>

                        {/* Create button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                className="w-full bg-lime px-8 py-4 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] sm:w-auto"
                            >
                                CREATE MATCH
                            </button>
                            <p className="mt-3 text-[10px] tracking-[0.15em] text-neutral-800">
                                {"// a lobby code will be generated for you"}
                            </p>
                        </div>
                    </div>

                    {/* ──── Right: Match Config Summary Panel ──── */}
                    <div className="self-start lg:sticky lg:top-8">
                        <Panel
                            label="MATCH CONFIG"
                            headerRight={
                                <span className="text-[10px] tracking-[0.2em] text-neutral-700">
                                    PREVIEW
                                </span>
                            }
                        >
                            <Panel.Rows>
                                <Panel.Row
                                    label="MODE"
                                    value={selectedMode.label}
                                    accent
                                />
                                <Panel.Row
                                    label="MAX PLAYERS"
                                    value={`${playerCount} players`}
                                    accent
                                />
                                <Panel.Row
                                    label="DIFFICULTY"
                                    value={
                                        difficulty.charAt(0).toUpperCase() +
                                        difficulty.slice(1)
                                    }
                                />
                                <Panel.Row
                                    label="VISIBILITY"
                                    value={
                                        visibility === "private"
                                            ? "Private \u2014 Invite Only"
                                            : "Public \u2014 Open Lobby"
                                    }
                                />
                            </Panel.Rows>
                        </Panel>

                        {/* Decorative text below panel */}
                        <p className="mt-4 text-[9px] tracking-[0.2em] text-neutral-800">
                            {selectedMode.tag} / {playerCount} MAX /{" "}
                            {difficulty.toUpperCase()} /{" "}
                            {visibility.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom decorative bar */}
            <div className="relative z-10 mt-auto flex items-center justify-between border-t border-neutral-800/50 px-6 py-3 lg:px-12">
                <span className="text-[9px] tracking-[0.3em] text-neutral-800">
                    ROYAL<span className="text-lime/30">TYPE</span>
                    {" // CREATE"}
                </span>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] tabular-nums tracking-[0.2em] text-neutral-800">
                        v0.1.0
                    </span>
                </div>
            </div>
        </main>
    );
}
