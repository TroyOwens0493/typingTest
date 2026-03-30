import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import { Panel } from "~/components/panel";
import { TypingTestComponent } from "~/components/typing-test-component";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import type { GameMode } from "~/models/gameModes";
import type { PlayerGameStats, TypingWord } from "~/models/typingTypes";

type EliminatedPlayer = {
    userId: Id<"user">;
    wpm: number;
    accuracy: number;
    timeInSeconds: number;
    eliminatedAt: number;
};

type OpponentState = {
    userId: string;
    username: string;
    stats: PlayerGameStats;
};

type PlayProps = {
    words: TypingWord[];
    isOwner: boolean;
    playerCount: number;
    maxPlayers: number;
    matchId: Id<"match">;
    currentUserId: Id<"user">;
    gamemode: GameMode;
    eliminatedPlayers: EliminatedPlayer[];
    opponentStates: OpponentState[];
    status: "waiting" | "playing" | "finished";
    startedAt?: number;
    joinCode: string;
    isSubmitting?: boolean;
    actionError?: string;
};

export function Play({
    words,
    isOwner,
    playerCount,
    maxPlayers,
    matchId,
    currentUserId,
    gamemode,
    eliminatedPlayers,
    opponentStates,
    status,
    startedAt,
    joinCode,
    isSubmitting,
    actionError,
}: PlayProps) {
    const showLobby = status === "waiting";
    const eliminatePlayer = useMutation(api.matches.eliminatePlayer);
    const updatePlayerGameState = useMutation(api.matches.updatePlayerGameState);

    const currentPlayerElimination = eliminatedPlayers.find(
        (player) => player.userId === currentUserId,
    );

    /** Persists the current player's elimination result in instant-fail mode. */
    const handlePlayerEliminated = useCallback(
        async (stats: PlayerGameStats) => {
            if (gamemode !== "instant-fail" || currentPlayerElimination) {
                return;
            }

            await eliminatePlayer({
                matchId,
                userId: currentUserId,
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                timeInSeconds: stats.timeInSeconds,
            });
        },
        [currentPlayerElimination, currentUserId, eliminatePlayer, gamemode, matchId],
    );

    /** Persists the current player's latest word snapshot at each word boundary. */
    const handleWordBoundary = useCallback(
        async (nextWords: TypingWord[]) => {
            await updatePlayerGameState({
                matchId,
                userId: currentUserId,
                words: nextWords,
            });
        },
        [currentUserId, matchId, updatePlayerGameState],
    );

    return (
        <main className="relative flex h-screen flex-col overflow-hidden bg-[#050505] font-mono text-neutral-400">
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                }}
            />

            <Nav />

            <div className="relative z-10 flex flex-1">
                {/* Main game area */}
                <div className="flex flex-1 flex-col">
                    {status === "playing" && opponentStates.length > 0 && (
                        <div className="px-6 pt-6 lg:px-12 lg:pt-8">
                            <div className="mx-auto w-full max-w-3xl border border-neutral-800/80 bg-[#0a0a0a]">
                                <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-3 sm:px-5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-slow" />
                                        <span className="text-[10px] tracking-[0.3em] text-neutral-600">
                                            OPPONENT LIVE STATS
                                        </span>
                                    </div>
                                    <span className="text-[9px] tracking-[0.2em] text-neutral-700">
                                        MATCH IN PROGRESS
                                    </span>
                                </div>

                                <div className="divide-y divide-neutral-800/50">
                                    {opponentStates.map((opponent) => (
                                        <div
                                            key={opponent.userId}
                                            className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] sm:px-5"
                                        >
                                            <div>
                                                <p className="text-[9px] tracking-[0.3em] text-neutral-700">
                                                    PLAYER
                                                </p>
                                                <p className="mt-1.5 truncate text-sm tracking-[0.08em] text-white">
                                                    {opponent.username}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] tracking-[0.3em] text-neutral-700">WPM</p>
                                                <p className="mt-1.5 text-sm tabular-nums text-lime">
                                                    {opponent.stats.wpm}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] tracking-[0.3em] text-neutral-700">ACC</p>
                                                <p className="mt-1.5 text-sm tabular-nums text-neutral-300">
                                                    {opponent.stats.accuracy}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] tracking-[0.3em] text-neutral-700">TIME</p>
                                                <p className="mt-1.5 text-sm tabular-nums text-neutral-300">
                                                    {opponent.stats.timeInSeconds}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <TypingTestComponent
                        words={words}
                        unfocusedMessage={showLobby ? "WAIT FOR HOST TO START THE ROUND" : undefined}
                        allowFocusChange={false}
                        timerStartTime={startedAt}
                        instantFailEnabled={gamemode === "instant-fail" && status === "playing"}
                        onEliminated={handlePlayerEliminated}
                        onWordBoundary={handleWordBoundary}
                        initialEliminatedStats={
                            currentPlayerElimination
                                ? {
                                    wpm: currentPlayerElimination.wpm,
                                    accuracy: currentPlayerElimination.accuracy,
                                    timeInSeconds: currentPlayerElimination.timeInSeconds,
                                }
                                : undefined
                        }
                    />
                </div>

                {/* Lobby panel - shown when waiting */}
                {showLobby && (
                    <div className="w-80 border-l border-neutral-800/80 bg-[#0a0a0a] p-6">
                        <Panel
                            label="LOBBY"
                            headerRight={
                                <span className="text-[10px] tracking-[0.2em] text-lime">
                                    LIVE
                                </span>
                            }
                        >
                            <Panel.Rows>
                                <Panel.Row
                                    label="PLAYERS IN LOBBY"
                                    value={`${playerCount} / ${maxPlayers}`}
                                    accent
                                />
                                <Panel.Row
                                    label="JOIN CODE"
                                    value={joinCode}
                                />
                                <Panel.Row
                                    label="GAME MODE"
                                    value="ELIMINATION"
                                />
                            </Panel.Rows>
                        </Panel>

                        {/* Start button for owner */}
                        {isOwner && (
                            <form method="post" className="mt-6">
                                <input type="hidden" name="intent" value="start-match" />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-lime px-6 py-4 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? "STARTING..." : "START ROUND"}
                                </button>
                                <p className="mt-3 text-[10px] tracking-[0.15em] text-neutral-800">
                                    {"// only the lobby owner can start"}
                                </p>
                            </form>
                        )}

                        {/* Waiting message for non-owners */}
                        {!isOwner && (
                            <div className="mt-6 border border-neutral-800/80 bg-[#0a0a0a] p-4">
                                <p className="text-center text-[11px] tracking-[0.15em] text-neutral-600">
                                    WAITING FOR HOST TO START...
                                </p>
                            </div>
                        )}

                        {/* Error message */}
                        {actionError && (
                            <div className="mt-4 border border-red-400/20 bg-red-400/5 p-3">
                                <p className="text-[10px] tracking-[0.1em] text-red-400">
                                    {actionError}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer label="PLAY" />
        </main>
    );
}
