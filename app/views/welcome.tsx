import { Logo } from "~/components/logo";
import { Panel } from "~/components/panel";
import { Footer } from "~/components/footer";
import { useNavigate } from "react-router";

type WelcomeProps = {
    login: () => void,
    signUp: () => void,
    practice: () => void
}

export function Welcome({ login, signUp, practice }: WelcomeProps) {
    const navigate = useNavigate();
    return (
        <main className="flex h-screen flex-col bg-[#050505] font-mono text-neutral-400">
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
                                onClick={() => navigate("signup")}
                            >
                                SIGN UP
                            </button>
                            <button
                                type="button"
                                className="border border-neutral-800 px-8 py-3.5 text-[11px] tracking-[0.2em] text-neutral-400 transition-all hover:border-neutral-600 hover:text-white"
                                onClick={() => navigate("login")}
                            >
                                LOG IN
                            </button>
                        </div>
                    </div>

                    {/* Queue terminal */}
                    <Panel
                        label="PLAYERS ONLINE NOW"
                        headerRight={
                            <span className="text-[10px] tabular-nums tracking-[0.2em] text-neutral-600">
                                111
                            </span>
                        }
                        className="self-start"
                    >
                        <Panel.Rows>
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
                                <Panel.Row
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                />
                            ))}
                        </Panel.Rows>
                    </Panel>
                </section>
            </div>

            <Footer label="WELCOME" />
        </main>
    );
}
