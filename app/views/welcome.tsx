import { Logo } from "~/components/logo";

type WelcomeProps = {
    login: () => void,
    signUp: () => void,
    practice: () => void
}

export function Welcome({ login, signUp, practice }: WelcomeProps) {
    return (
        <main className="h-screen overflow-hidden bg-[#050505] font-mono text-neutral-400">
            {/* Scanline texture */}
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                }}
            />

            {/* Navigation */}
            <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
                <Logo />
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="px-4 py-2 text-[11px] tracking-[0.15em] text-neutral-600 transition-colors hover:text-white"
                        onClick={login}
                    >
                        LOG IN
                    </button>
                    <button
                        type="button"
                        className="border border-neutral-800 px-5 py-2 text-[11px] tracking-[0.15em] text-white transition-all hover:border-lime hover:text-lime"
                        onClick={signUp}
                    >
                        SIGN UP
                    </button>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
                {/* ─── Hero ─── */}
                <section className="grid gap-16 pb-20 pt-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-12 lg:pt-20">
                    <div>
                        <p className="mb-8 text-[11px] tracking-[0.3em] text-lime">
                            &gt; COMPETITIVE TYPING ROYALE
                            <span className="animate-blink">_</span>
                        </p>

                        <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.92] tracking-tight text-white">
                            Go faster.
                            <br />
                            <span className="text-lime">Type cleaner.</span>
                            <br />
                            <span className="text-neutral-700">Own the lobby.</span>
                        </h1>

                        <p className="mt-10 max-w-lg text-sm leading-relaxed text-neutral-500">
                            Create your own arena or join a random lobby in seconds. Speed
                            and accuracy decide who climbs the ladder and who gets eliminated.
                        </p>

                        <div className="mt-12 flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                className="bg-lime px-8 py-3.5 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d]"
                            >
                                JOIN RANDOM
                            </button>
                            <button
                                type="button"
                                className="border border-neutral-800 px-8 py-3.5 text-[11px] tracking-[0.2em] text-neutral-400 transition-all hover:border-neutral-600 hover:text-white"
                            >
                                JOIN WITH CODE
                            </button>
                        </div>

                        <p className="mt-6 text-[10px] tracking-[0.2em] text-neutral-700">
                            {"// sign up to create your own lobby"}
                        </p>
                    </div>

                    {/* Queue terminal */}
                    <div className="self-start border border-neutral-800/80 bg-[#0a0a0a]">
                        <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-slow" />
                                <span className="text-[10px] tracking-[0.3em] text-neutral-600">
                                    PLAYERS ONLINE NOW
                                </span>
                            </div>
                            <span className="text-[10px] tabular-nums tracking-[0.2em] text-neutral-600">
                                111
                            </span>
                        </div>

                        <div className="divide-y divide-neutral-800/50">
                            {[
                                {
                                    label: "FORMAT",
                                    value: "Elimintion / Points / Instant fail",
                                },
                                {
                                    label: "RANDOM",
                                    value: "Join a lobby with randoms",
                                },
                                {
                                    label: "PRIVATE",
                                    value: "Lobbies for friends",
                                },
                            ].map((item) => (
                                <div key={item.label} className="px-4 py-4">
                                    <span className="text-[9px] tracking-[0.3em] text-neutral-700">
                                        {item.label}
                                    </span>
                                    <p className="mt-1.5 text-xs text-neutral-400">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-neutral-800/80 p-3">
                            <button
                                type="button"
                                className="w-full py-3 text-[10px] tracking-[0.3em] text-neutral-600 transition-colors hover:text-lime"
                                onClick={practice}
                            >
                                PRACTICE {"\u2192"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
