import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import { Panel } from "~/components/panel";
import { TypingTestComponent } from "~/components/typing-test-component";
import type { TypingWord } from "~/models/typingTypes";
import type { Id } from "~/convex/_generated/dataModel";

type PlayProps = {
    words: TypingWord[];
    isOwner: boolean;
    playerCount: number;
    maxPlayers: number;
    matchId: Id<"match">;
    currentUserId: Id<"user">;
    status: "waiting" | "playing" | "finished";
    joinCode: string;
    isSubmitting?: boolean;
    actionError?: string;
};

export function Play({
    words,
    isOwner,
    playerCount,
    maxPlayers,
    status,
    joinCode,
    isSubmitting,
    actionError,
}: PlayProps) {
    const showLobby = status === "waiting";

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
                <div className="flex-1">
                    <TypingTestComponent
                        words={words}
                        unfocusedMessage={showLobby ? "WAIT FOR HOST TO START THE ROUND" : undefined}
                        allowFocusChange={false}
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
