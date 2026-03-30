import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import { Panel } from "~/components/panel";
import type { Id } from "~/convex/_generated/dataModel";

type EliminatedPlayer = {
    userId: Id<"user">;
    wpm: number;
    accuracy: number;
    timeInSeconds: number;
    eliminatedAt: number;
};

type ResultsProps = {
    matchId: Id<"match">;
    currentUserId: Id<"user">;
    ownerId: Id<"user">;
    winnerId?: Id<"user">;
    eliminatedPlayers: EliminatedPlayer[];
    players: Array<{
        userId: Id<"user">;
        username: string;
    }>;
    joinCode: string;
    gamemode: string;
    status: "waiting" | "playing" | "finished";
    isSubmitting: boolean;
};

/** Builds the placement list with the surviving winner first. */
function getPlacements({
    players,
    winnerId,
    eliminatedPlayers,
}: Pick<ResultsProps, "players" | "winnerId" | "eliminatedPlayers">) {
    const eliminatedIds = new Set(eliminatedPlayers.map((player) => player.userId));
    const survivingPlayers = players.filter((player) => !eliminatedIds.has(player.userId));
    const championId = winnerId ?? survivingPlayers[0]?.userId;
    const playerLookup = new Map(players.map((player) => [player.userId, player.username]));

    return [
        ...(championId
            ? [
                  {
                      userId: championId,
                      username: playerLookup.get(championId) ?? "Unknown player",
                      result: "WINNER",
                      summary: "Last player standing",
                  },
              ]
            : []),
        ...[...eliminatedPlayers]
            .sort((left, right) => right.eliminatedAt - left.eliminatedAt)
            .map((player) => ({
                userId: player.userId,
                username: playerLookup.get(player.userId) ?? "Unknown player",
                result: "ELIMINATED",
                summary: `${player.wpm} WPM / ${player.accuracy}% ACC / ${player.timeInSeconds}s`,
            })),
    ];
}

export function Results({
    matchId,
    currentUserId,
    ownerId,
    winnerId,
    eliminatedPlayers,
    players,
    joinCode,
    gamemode,
    status,
    isSubmitting,
}: ResultsProps) {
    const placements = getPlacements({ players, winnerId, eliminatedPlayers });
    const isOwner = ownerId === currentUserId;
    const didCurrentUserWin = winnerId === currentUserId;
    const winnerName = players.find((player) => player.userId === winnerId)?.username;

    return (
        <main className="relative flex min-h-screen flex-col bg-[#050505] font-mono text-neutral-400">
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                }}
            />

            <Nav />

            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 pb-16 pt-10 lg:px-12 lg:pt-16">
                <section className="border border-neutral-800/80 bg-[#0a0a0a] px-6 py-8 sm:px-8">
                    <p className="text-[10px] tracking-[0.35em] text-lime">MATCH RESULTS</p>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
                    <Panel
                        label="PLACEMENTS"
                        headerRight={
                            <span className="text-[10px] tracking-[0.2em] text-neutral-600">
                                {placements.length} PLAYERS
                            </span>
                        }
                    >
                        <div className="divide-y divide-neutral-800/50">
                            {placements.map((player, index) => (
                                <div
                                    key={player.userId}
                                    className="grid gap-3 px-4 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:px-5"
                                >
                                    <div>
                                        <p className="text-[9px] tracking-[0.3em] text-neutral-700">PLACE</p>
                                        <p className="mt-1.5 text-lg tabular-nums text-neutral-300">#{index + 1}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] tracking-[0.3em] text-neutral-700">PLAYER</p>
                                        <p className="mt-1.5 text-sm tracking-[0.08em] text-white">
                                            {player.userId === currentUserId ? "YOU" : player.username}
                                        </p>
                                        <p className="mt-1 text-[10px] tracking-[0.12em] text-neutral-600">
                                            {player.summary}
                                        </p>
                                    </div>
                                    <div className="self-start border border-neutral-800/80 px-3 py-2 text-[10px] tracking-[0.2em] text-lime">
                                        {player.result}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <div className="space-y-6">
                        <Panel
                            label="WINNER"
                            headerRight={
                                <span className="text-[10px] tracking-[0.2em] text-lime">LOCKED</span>
                            }
                        >
                            <Panel.Rows>
                                <Panel.Row
                                    label="PLAYER"
                                    value={winnerId === currentUserId ? "YOU" : winnerName ?? "PENDING"}
                                    accent
                                />
                                <Panel.Row
                                    label="ROUND TYPE"
                                    value="LAST PLAYER STANDING"
                                />
                            </Panel.Rows>
                        </Panel>

                        <Panel
                            label="NEXT ROUND"
                            headerRight={
                                <span className="text-[10px] tracking-[0.2em] text-neutral-600">
                                    {isOwner ? "HOST CONTROL" : "WAITING"}
                                </span>
                            }
                        >
                            <div className="px-4 py-5 sm:px-5">
                                {isOwner ? (
                                    <form method="post">
                                        <input type="hidden" name="intent" value="restart-match" />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-lime px-6 py-4 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? "RESTARTING..." : "RESTART GAME"}
                                        </button>
                                        <p className="mt-3 text-[10px] tracking-[0.12em] text-neutral-600">
                                            Reset the match to the lobby and start a fresh instant-fail round.
                                        </p>
                                    </form>
                                ) : (
                                    <p className="text-[11px] tracking-[0.15em] text-neutral-500">
                                        WAITING FOR THE HOST TO RESTART THE MATCH.
                                    </p>
                                )}
                            </div>
                        </Panel>
                    </div>
                </section>
            </div>

            <Footer label="RESULTS" />
        </main>
    );
}
