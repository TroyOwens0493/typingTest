import { Nav } from "~/components/nav";

/*
 * Mock data — replace with real data once the API / data layer is wired up.
 */
const PLAYER = {
    name: "ghostkey_",
    rank: "DIAMOND III",
    level: 42,
};

const STATS = {
    gamesPlayed: 142,
    gamesWon: 89,
    winRate: 63,
    avgWpm: 78,
    peakWpm: 124,
    totalTime: "42h 17m",
    avgAccuracy: 94,
};

const RECENT_SESSIONS = [
    { id: 1, duration: "2m 34s", wpm: 92, accuracy: 97, result: "WIN" as const, placed: "1st", of: 6 },
    { id: 2, duration: "1m 48s", wpm: 84, accuracy: 94, result: "ELIM" as const, placed: "3rd", of: 8 },
    { id: 3, duration: "3m 12s", wpm: 76, accuracy: 91, result: "WIN" as const, placed: "1st", of: 4 },
    { id: 4, duration: "2m 01s", wpm: 88, accuracy: 96, result: "ELIM" as const, placed: "4th", of: 10 },
    { id: 5, duration: "2m 55s", wpm: 81, accuracy: 93, result: "WIN" as const, placed: "1st", of: 5 },
];

/* ─── Stat Card ─── */
function StatCard({
    label,
    value,
    accent,
    sub,
}: {
    label: string;
    value: string | number;
    accent?: boolean;
    sub?: string;
}) {
    return (
        <div className="border border-neutral-800/80 bg-[#0a0a0a] px-5 py-5">
            <span className="text-[9px] tracking-[0.3em] text-neutral-700">
                {label}
            </span>
            <p
                className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${
                    accent ? "text-lime" : "text-neutral-300"
                }`}
            >
                {value}
            </p>
            {sub && (
                <span className="mt-1.5 block text-[10px] tracking-[0.15em] text-neutral-700">
                    {sub}
                </span>
            )}
        </div>
    );
}

export function Main() {
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
                {/* Dashboard header */}
                <div className="mb-12">
                    <p className="mb-4 text-[11px] tracking-[0.3em] text-lime">
                        &gt; PLAYER DASHBOARD
                        <span className="animate-blink">_</span>
                    </p>

                    <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-tight text-white">
                            {PLAYER.name}
                        </h1>
                        <div className="mb-1 flex items-center gap-3">
                            <span className="border border-lime/30 px-2.5 py-1 text-[9px] tracking-[0.25em] text-lime">
                                {PLAYER.rank}
                            </span>
                            <span className="text-[10px] tracking-[0.2em] text-neutral-700">
                                LVL {PLAYER.level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Primary Stats Grid ─── */}
                <section className="mb-14">
                    <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                        LIFETIME STATS
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        <StatCard
                            label="GAMES PLAYED"
                            value={STATS.gamesPlayed}
                            sub="total matches"
                        />
                        <StatCard
                            label="GAMES WON"
                            value={STATS.gamesWon}
                        />
                        <StatCard
                            label="WIN RATE"
                            value={`${STATS.winRate}%`}
                            accent
                        />
                        <StatCard
                            label="AVG WPM"
                            value={STATS.avgWpm}
                            accent
                            sub="words per minute"
                        />
                        <StatCard
                            label="PEAK WPM"
                            value={STATS.peakWpm}
                            accent
                            sub="personal best"
                        />
                        <StatCard
                            label="TOTAL TIME"
                            value={STATS.totalTime}
                        />
                        <StatCard
                            label="AVG ACCURACY"
                            value={`${STATS.avgAccuracy}%`}
                            sub="correct keystrokes"
                        />
                    </div>
                </section>

                {/* ─── Recent Sessions ─── */}
                <section>
                    <div className="border border-neutral-800/80 bg-[#0a0a0a]">
                        {/* Table header bar */}
                        <div className="flex items-center justify-between border-b border-neutral-800/80 px-5 py-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-slow" />
                                <span className="text-[10px] tracking-[0.3em] text-neutral-600">
                                    RECENT SESSIONS
                                </span>
                            </div>
                            <span className="text-[10px] tabular-nums tracking-[0.2em] text-neutral-600">
                                LAST {RECENT_SESSIONS.length}
                            </span>
                        </div>

                        {/* Column labels */}
                        <div className="grid grid-cols-[2.5rem_5.5rem_4rem_4.5rem_4rem_1fr] items-center gap-2 border-b border-neutral-800/50 px-5 py-2.5 text-[9px] tracking-[0.25em] text-neutral-700">
                            <span>#</span>
                            <span>TIME</span>
                            <span>WPM</span>
                            <span>ACC</span>
                            <span>RESULT</span>
                            <span className="text-right">PLACED</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-neutral-800/50">
                            {RECENT_SESSIONS.map((session) => (
                                <div
                                    key={session.id}
                                    className="grid grid-cols-[2.5rem_5.5rem_4rem_4.5rem_4rem_1fr] items-center gap-2 px-5 py-3.5 text-xs transition-colors hover:bg-neutral-800/10"
                                >
                                    <span className="tabular-nums text-neutral-700">
                                        {session.id}
                                    </span>
                                    <span className="tabular-nums text-neutral-500">
                                        {session.duration}
                                    </span>
                                    <span className="tabular-nums text-lime">
                                        {session.wpm}
                                    </span>
                                    <span className="tabular-nums text-neutral-400">
                                        {session.accuracy}%
                                    </span>
                                    <span
                                        className={`text-[10px] font-medium tracking-[0.15em] ${
                                            session.result === "WIN"
                                                ? "text-lime"
                                                : "text-red-400/80"
                                        }`}
                                    >
                                        {session.result}
                                    </span>
                                    <span className="text-right tabular-nums text-neutral-600">
                                        {session.placed}{" "}
                                        <span className="text-neutral-800">
                                            / {session.of}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-neutral-800/80 p-3">
                            <button
                                type="button"
                                className="w-full py-2.5 text-[10px] tracking-[0.3em] text-neutral-600 transition-colors hover:text-lime"
                            >
                                VIEW ALL SESSIONS {"\u2192"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom decorative bar */}
            <div className="relative z-10 mt-auto flex items-center justify-between border-t border-neutral-800/50 px-6 py-3 lg:px-12">
                <span className="text-[9px] tracking-[0.3em] text-neutral-800">
                    ROYAL<span className="text-lime/30">TYPE</span>
                    {" // HOME"}
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
