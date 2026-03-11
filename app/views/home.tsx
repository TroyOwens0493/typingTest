import { Nav } from "~/components/nav";
import { Panel } from "~/components/panel";
import { Footer } from "~/components/footer";

type Dashboard = {
    name: string;
    rank: string;
    level: number;
    gamesPlayed: number;
    gamesWon: number;
    averageWPM: number;
    peakWPM: number;
    totalTime: number;
    averageAccuracy: number;
    recentSessions: Array<{
        id: number;
        duration: string;
        wpm: number;
        accuracy: number;
        result: string;
        place: number;
    }>;
};

function formatTotalTime(totalTime: number) {
    if (totalTime <= 0) {
        return "0s";
    }

    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

function formatPlace(place: number) {
    const mod10 = place % 10;
    const mod100 = place % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return `${place}st`;
    }

    if (mod10 === 2 && mod100 !== 12) {
        return `${place}nd`;
    }

    if (mod10 === 3 && mod100 !== 13) {
        return `${place}rd`;
    }

    return `${place}th`;
}

/* ─── Stat Card ─── */
function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | number;
    accent?: boolean;
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
        </div>
    );
}

export function Main({ dashboard }: { dashboard: Dashboard }) {
    const winRate =
        dashboard.gamesPlayed > 0
            ? Math.round((dashboard.gamesWon / dashboard.gamesPlayed) * 100)
            : 0;

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
                            {dashboard.name}
                        </h1>
                        <div className="mb-1 flex items-center gap-3">
                            <span className="border border-lime/30 px-2.5 py-1 text-[9px] tracking-[0.25em] text-lime">
                                {dashboard.rank}
                            </span>
                            <span className="text-[10px] tracking-[0.2em] text-neutral-700">
                                LVL {dashboard.level}
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
                            value={dashboard.gamesPlayed}
                        />
                        <StatCard
                            label="GAMES WON"
                            value={dashboard.gamesWon}
                        />
                        <StatCard
                            label="WIN RATE"
                            value={`${winRate}%`}
                            accent
                        />
                        <StatCard
                            label="AVG WPM"
                            value={dashboard.averageWPM}
                            accent
                        />
                        <StatCard
                            label="PEAK WPM"
                            value={dashboard.peakWPM}
                            accent
                        />
                        <StatCard
                            label="TOTAL TIME"
                            value={formatTotalTime(dashboard.totalTime)}
                        />
                        <StatCard
                            label="AVG ACCURACY"
                            value={`${dashboard.averageAccuracy}%`}
                        />
                    </div>
                </section>

                {/* ─── Recent Sessions ─── */}
                <section>
                    <Panel
                        label="RECENT SESSIONS"
                        headerRight={
                            <span className="text-[10px] tabular-nums tracking-[0.2em] text-neutral-600">
                                LAST {dashboard.recentSessions.length}
                            </span>
                        }
                    >
                        {/* Column labels */}
                        <div className="grid grid-cols-[2.5rem_5.5rem_4rem_4.5rem_4rem_1fr] items-center gap-2 border-b border-neutral-800/50 px-5 py-2.5 text-[9px] tracking-[0.25em] text-neutral-700">
                            <span>#</span>
                            <span>TIME</span>
                            <span>WPM</span>
                            <span>ACC</span>
                            <span>RESULT</span>
                            <span className="text-right">PLACE</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-neutral-800/50">
                            {dashboard.recentSessions.length > 0 ? (
                                dashboard.recentSessions.map((session) => (
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
                                                session.result.toUpperCase() === "WIN"
                                                    ? "text-lime"
                                                    : "text-red-400/80"
                                            }`}
                                        >
                                            {session.result}
                                        </span>
                                        <span className="text-right tabular-nums text-neutral-600">
                                            {formatPlace(session.place)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-6 text-xs tracking-[0.15em] text-neutral-700">
                                    NO SESSIONS RECORDED YET
                                </div>
                            )}
                        </div>
                    </Panel>
                </section>
            </div>

            <Footer label="HOME" />
        </main>
    );
}
