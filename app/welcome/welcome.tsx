export function Welcome() {
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
                <span className="font-display text-xl font-bold tracking-tight text-white">
                    ROYAL<span className="text-lime">TYPE</span>
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="px-4 py-2 text-[11px] tracking-[0.15em] text-neutral-600 transition-colors hover:text-white"
                    >
                        LOG IN
                    </button>
                    <button
                        type="button"
                        className="border border-neutral-800 px-5 py-2 text-[11px] tracking-[0.15em] text-white transition-all hover:border-lime hover:text-lime"
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
                            Aim faster.
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
                                    CURRENT QUEUE
                                </span>
                            </div>
                            <span className="text-[10px] tabular-nums tracking-[0.2em] text-neutral-600">
                                02:14
                            </span>
                        </div>

                        <div className="divide-y divide-neutral-800/50">
                            {[
                                {
                                    label: "FORMAT",
                                    value: "12 players / 3 rounds / acc lock",
                                },
                                {
                                    label: "RANDOM",
                                    value: "Live now \u2014 starts in 02:14",
                                },
                                {
                                    label: "PRIVATE",
                                    value: "Lobbies for squads + friends",
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
                            >
                                RUN WARMUP {"\u2192"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ─── Stats strip ─── */}
                <div className="grid grid-cols-3 border-y border-neutral-800/60 py-8">
                    {[
                        { label: "LIVE LOBBIES", value: "24 / 7" },
                        { label: "ACTIVE FIGHTERS", value: "12,480" },
                        { label: "DAILY LADDERS", value: "5 tiers" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-[9px] tracking-[0.35em] text-neutral-700">
                                {stat.label}
                            </p>
                            <p className="mt-2 font-display text-lg font-bold text-white">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ─── Features ─── */}
                <section className="py-24">
                    <div className="divide-y divide-neutral-800/40">
                        {[
                            {
                                num: "01",
                                title: "Random drop-in",
                                desc: "Instant matchmaking fills a lobby fast so you can focus on clean execution.",
                            },
                            {
                                num: "02",
                                title: "Private lobbies",
                                desc: "Spin up a room, share a code, and run bracket fights with your crew.",
                            },
                            {
                                num: "03",
                                title: "Performance analytics",
                                desc: "Track burst speed, recovery time, and focus streaks in every fight.",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.num}
                                className="group grid grid-cols-[3rem_1fr] gap-6 py-10 sm:grid-cols-[4rem_1fr_1fr] sm:gap-10"
                            >
                                <span className="pt-1 font-display text-3xl font-bold text-neutral-800/80 transition-colors group-hover:text-lime-dim sm:text-4xl">
                                    {feature.num}
                                </span>
                                <div className="sm:pt-1">
                                    <h3 className="font-display text-lg font-bold text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500 sm:hidden">
                                        {feature.desc}
                                    </p>
                                </div>
                                <p className="col-start-2 -mt-2 max-w-md text-sm leading-relaxed text-neutral-500 max-sm:hidden sm:col-start-3 sm:mt-0 sm:pt-1">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── How it works ─── */}
                <section className="border-t border-neutral-800/60 pb-28 pt-24">
                    <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <p className="mb-5 text-[10px] tracking-[0.3em] text-neutral-700">
                                HOW IT WORKS
                            </p>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">
                                From warmup
                                <br />
                                to champion.
                            </h2>
                            <p className="mt-5 text-sm leading-relaxed text-neutral-500">
                                Earn your seat, keep your accuracy, and fight through three
                                rounds. The last typist standing takes the win.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    step: "01",
                                    label: "Warmup gate",
                                    desc: "Prove you belong",
                                },
                                {
                                    step: "02",
                                    label: "Live drop",
                                    desc: "Enter the arena",
                                },
                                {
                                    step: "03",
                                    label: "Final duel",
                                    desc: "Last one standing",
                                },
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="group border border-neutral-800/60 p-5 transition-all hover:border-lime-faint"
                                >
                                    <span className="font-display text-3xl font-bold text-neutral-800 transition-colors group-hover:text-lime-dim">
                                        {item.step}
                                    </span>
                                    <p className="mt-4 font-display text-sm font-semibold text-white">
                                        {item.label}
                                    </p>
                                    <p className="mt-1.5 text-xs text-neutral-600">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
