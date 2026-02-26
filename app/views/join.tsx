import { useState, useRef, useCallback } from "react";
import { Nav } from "~/components/nav";
import { Panel } from "~/components/panel";
import { Footer } from "~/components/footer";

/* ─── Types ─── */
type JoinMode = "random" | "code";

/* ─── Fixed code cell positions (avoids array-index keys) ─── */
const CODE_POSITIONS_LEFT = [
    { key: "pos-0", idx: 0 },
    { key: "pos-1", idx: 1 },
    { key: "pos-2", idx: 2 },
] as const;

const CODE_POSITIONS_RIGHT = [
    { key: "pos-3", idx: 3 },
    { key: "pos-4", idx: 4 },
    { key: "pos-5", idx: 5 },
] as const;

/* ─── Join Option Card ─── */
function JoinOptionCard({
    id,
    tag,
    label,
    description,
    selected,
    onSelect,
}: {
    id: JoinMode;
    tag: string;
    label: string;
    description: string;
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

            <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
                <span
                    className={`text-[9px] tracking-[0.3em] ${selected ? "text-lime" : "text-neutral-700"
                        }`}
                >
                    {tag}
                </span>
                <p
                    className={`mt-2 font-display text-lg font-bold tracking-tight sm:text-xl ${selected ? "text-white" : "text-neutral-500"
                        }`}
                >
                    {label}
                </p>
                <p
                    className={`mt-2 text-[11px] leading-relaxed sm:text-xs ${selected ? "text-neutral-400" : "text-neutral-700"
                        }`}
                >
                    {description}
                </p>

                {/* Inline action hint */}
                <span
                    className={`mt-4 inline-block text-[10px] tracking-[0.2em] transition-colors ${selected
                        ? "text-lime"
                        : "text-neutral-800 group-hover:text-neutral-600"
                        }`}
                >
                    {id === "random" ? "QUEUE INSTANTLY \u2192" : "ENTER CODE BELOW \u2193"}
                </span>
            </div>
        </button>
    );
}

/* ─── Code Input Cell ─── */
function CodeCell({
    value,
    focused,
    filled,
    inputRef,
    onInput,
    onKeyDown,
    onFocus,
    onPaste,
    index,
}: {
    value: string;
    focused: boolean;
    filled: boolean;
    inputRef: (el: HTMLInputElement | null) => void;
    onInput: (char: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    index: number;
}) {
    return (
        <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={1}
            value={value}
            aria-label={`Code digit ${index + 1}`}
            onFocus={onFocus}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            onChange={(e) => {
                const char = e.target.value.slice(-1).toUpperCase();
                if (/^[A-Z0-9]$/.test(char)) {
                    onInput(char);
                }
            }}
            className={`h-14 w-11 border bg-[#0a0a0a] text-center font-display text-xl font-bold uppercase tracking-widest text-white caret-lime outline-none transition-all sm:h-16 sm:w-13 sm:text-2xl ${focused
                ? "border-lime bg-lime-faint shadow-[0_0_8px_rgba(190,255,0,0.15)]"
                : filled
                    ? "border-neutral-600"
                    : "border-neutral-800/80"
                }`}
        />
    );
}

/* ═══════════════════════════════════════════════════════
   JOIN MATCH VIEW
   ═══════════════════════════════════════════════════════ */
export function Join() {
    const [joinMode, setJoinMode] = useState<JoinMode>("random");
    const [lobbyCode, setLobbyCode] = useState<string[]>(Array(6).fill(""));
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const setRef = useCallback(
        (index: number) => (el: HTMLInputElement | null) => {
            inputRefs.current[index] = el;
        },
        [],
    );

    const codeComplete = lobbyCode.every((c) => c !== "");
    const codeDisplay = lobbyCode.join("");

    /* ─── Input handlers ─── */
    function handleInput(index: number, char: string) {
        const next = [...lobbyCode];
        next[index] = char;
        setLobbyCode(next);

        // Auto-advance to next empty cell
        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (lobbyCode[index] !== "") {
                const next = [...lobbyCode];
                next[index] = "";
                setLobbyCode(next);
            } else if (index > 0) {
                const next = [...lobbyCode];
                next[index - 1] = "";
                setLobbyCode(next);
                inputRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6);

        if (pasted.length > 0) {
            const next = [...lobbyCode];
            for (let i = 0; i < pasted.length && i < 6; i++) {
                next[i] = pasted[i];
            }
            setLobbyCode(next);
            // Focus last filled or next empty
            const focusTarget = Math.min(pasted.length, 5);
            inputRefs.current[focusTarget]?.focus();
        }
    }

    function handleClear() {
        setLobbyCode(Array(6).fill(""));
        inputRefs.current[0]?.focus();
    }

    function handleSelectCodeMode() {
        setJoinMode("code");
        // Focus first empty input after a tick (allows render)
        setTimeout(() => {
            const firstEmpty = lobbyCode.findIndex((c) => c === "");
            const target = firstEmpty === -1 ? 0 : firstEmpty;
            inputRefs.current[target]?.focus();
        }, 50);
    }

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
                        &gt; JOIN MATCH
                        <span className="animate-blink">_</span>
                    </p>

                    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-tight text-white">
                        Enter the Arena
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                        Joing a random match or use a lobby code from a
                        friend.
                    </p>
                </div>

                {/* ─── Two-column layout ─── */}
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
                    {/* ──── Left: Join Options + Code Input ──── */}
                    <div className="space-y-12">
                        {/* Match Type Selection */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                MATCH TYPE
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <JoinOptionCard
                                    id="random"
                                    tag="INSTANT MATCHMAKING"
                                    label="RANDOM"
                                    description="Queue into the next open lobby instantly."
                                    selected={joinMode === "random"}
                                    onSelect={() => setJoinMode("random")}
                                />
                                <JoinOptionCard
                                    id="code"
                                    tag="PRIVATE LOBBY"
                                    label="WITH CODE"
                                    description="Have a lobby code from a friend? Enter it below to join their match."
                                    selected={joinMode === "code"}
                                    onSelect={handleSelectCodeMode}
                                />
                            </div>
                        </section>

                        {/* Lobby Code Entry */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                ENTER LOBBY CODE
                            </p>
                            <Panel
                                label="LOBBY CODE"
                                active={joinMode === "code"}
                                headerRight={
                                    codeDisplay.length > 0 ? (
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="text-[10px] tracking-[0.2em] text-neutral-700 transition-colors hover:text-neutral-400"
                                        >
                                            CLEAR
                                        </button>
                                    ) : undefined
                                }
                                footer={
                                    <div className="px-4 py-4 sm:px-5">
                                        <button
                                            type="button"
                                            disabled={!codeComplete}
                                            className={`w-full py-3.5 text-[11px] font-bold tracking-[0.2em] transition-all ${codeComplete
                                                ? "bg-lime text-black hover:bg-[#d4ff4d]"
                                                : "border border-neutral-800/80 bg-transparent text-neutral-700 cursor-not-allowed"
                                                }`}
                                        >
                                            {codeComplete
                                                ? `JOIN \u2014 ${codeDisplay.slice(0, 3)}-${codeDisplay.slice(3)}`
                                                : "ENTER CODE TO JOIN"}
                                        </button>
                                    </div>
                                }
                            >
                                {/* Code inputs */}
                                <div className="px-4 py-8 sm:px-5 sm:py-10">
                                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                                        {CODE_POSITIONS_LEFT.map((pos) => (
                                            <CodeCell
                                                key={pos.key}
                                                index={pos.idx}
                                                value={lobbyCode[pos.idx]}
                                                focused={focusedIndex === pos.idx}
                                                filled={lobbyCode[pos.idx] !== ""}
                                                inputRef={setRef(pos.idx)}
                                                onInput={(c) => handleInput(pos.idx, c)}
                                                onKeyDown={(e) => handleKeyDown(pos.idx, e)}
                                                onFocus={() => setFocusedIndex(pos.idx)}
                                                onPaste={handlePaste}
                                            />
                                        ))}

                                        {/* Separator dash */}
                                        <span className="px-1 font-display text-xl text-neutral-700 sm:px-2">
                                            &mdash;
                                        </span>

                                        {CODE_POSITIONS_RIGHT.map((pos) => (
                                            <CodeCell
                                                key={pos.key}
                                                index={pos.idx}
                                                value={lobbyCode[pos.idx]}
                                                focused={focusedIndex === pos.idx}
                                                filled={lobbyCode[pos.idx] !== ""}
                                                inputRef={setRef(pos.idx)}
                                                onInput={(c) => handleInput(pos.idx, c)}
                                                onKeyDown={(e) => handleKeyDown(pos.idx, e)}
                                                onFocus={() => setFocusedIndex(pos.idx)}
                                                onPaste={handlePaste}
                                            />
                                        ))}
                                    </div>

                                    <p className="mt-5 text-center text-[10px] tracking-[0.1em] text-neutral-700">
                                        {"// 6-character alphanumeric code"}
                                    </p>
                                </div>
                            </Panel>
                        </section>

                        {/* Random queue CTA (shown when random is selected) */}
                        {joinMode === "random" && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    className="w-full bg-lime px-8 py-4 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] sm:w-auto"
                                >
                                    FIND MATCH
                                </button>
                                <p className="mt-3 text-[10px] tracking-[0.15em] text-neutral-800">
                                    {"// you'll be placed in the next available lobby"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ──── Right: Queue Status Panel ──── */}
                    <div className="self-start lg:sticky lg:top-8">
                        <Panel
                            label="QUEUE STATUS"
                            headerRight={
                                <span className="text-[10px] tracking-[0.2em] text-lime">
                                    LIVE
                                </span>
                            }
                        >
                            <Panel.Rows>
                                <Panel.Row
                                    label="LOBBIES OPEN"
                                    value="12 active"
                                    accent
                                />
                                <Panel.Row
                                    label="PLAYERS QUEUED"
                                    value="47 waiting"
                                    accent
                                />
                                <Panel.Row
                                    label="AVG WAIT TIME"
                                    value="~8 seconds"
                                />
                                <Panel.Row
                                    label="YOUR REGION"
                                    value="US-EAST"
                                />
                            </Panel.Rows>
                        </Panel>

                        {/* Decorative text below panel */}
                        <p className="mt-4 text-[9px] tracking-[0.2em] text-neutral-800">
                            {joinMode === "random"
                                ? "RANDOM QUEUE / AUTO-ASSIGN / ALL MODES"
                                : codeComplete
                                    ? `PRIVATE LOBBY / CODE: ${codeDisplay.slice(0, 3)}-${codeDisplay.slice(3)}`
                                    : "PRIVATE LOBBY / AWAITING CODE"}
                        </p>
                    </div>
                </div>
            </div>

            <Footer label="JOIN" />
        </main>
    );
}
