import { useState } from "react";
import { Link } from "react-router";
import { Logo } from "~/components/logo";
import { InputField } from "~/components/input-field";
import { Panel } from "~/components/panel";
import { Footer } from "~/components/footer";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const canSubmit = email.length > 0 && password.length > 0;

    function handleSubmit() {
        if (!canSubmit) return;
        // TODO: wire up to API
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

            {/* Minimal pre-auth header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
                <Link to="/">
                    <Logo />
                </Link>
                <div className="flex items-center gap-1">
                    <Link
                        to="/signup"
                        className="border border-neutral-800 px-5 py-2 text-[11px] tracking-[0.15em] text-white transition-all hover:border-lime hover:text-lime"
                    >
                        SIGN UP
                    </Link>
                </div>
            </header>

            {/* ─── Content ─── */}
            <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-10 lg:px-12 lg:pt-16">
                {/* Page header */}
                <div className="mb-12">
                    <p className="mb-4 text-[11px] tracking-[0.3em] text-lime">
                        &gt; WELCOME BACK
                        <span className="animate-blink">_</span>
                    </p>

                    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-tight text-white">
                        Back in the fight.
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                        Log in to pick up where you left off.
                    </p>
                </div>

                {/* ─── Two-column layout ─── */}
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
                    {/* ──── Left: Login Form ──── */}
                    <div className="space-y-12">
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                CREDENTIALS
                            </p>

                            <Panel
                                label="RETURNING PLAYER"
                                headerRight={
                                    <span className="text-[10px] tracking-[0.2em] text-neutral-800">
                                        ACCOUNT INFO
                                    </span>
                                }
                            >
                                {/* Form fields */}
                                <div className="space-y-5 px-5 py-5">
                                    <InputField
                                        label="EMAIL"
                                        type="email"
                                        value={email}
                                        onChange={setEmail}
                                        placeholder="you@example.com"
                                    />
                                    <InputField
                                        label="PASSWORD"
                                        type="password"
                                        value={password}
                                        onChange={setPassword}
                                        placeholder="enter your password"
                                    />

                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={!canSubmit}
                                            className="w-full bg-lime py-3.5 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:px-8"
                                        >
                                            LOG IN
                                        </button>
                                        <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-800">
                                            {"// you'll be redirected to your dashboard"}
                                        </p>
                                    </div>
                                </div>
                            </Panel>
                        </section>

                        {/* Don't have an account */}
                        <div>
                            <p className="text-[11px] tracking-[0.1em] text-neutral-600">
                                Don&rsquo;t have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="tracking-[0.15em] text-neutral-400 transition-colors hover:text-lime"
                                >
                                    SIGN UP &rarr;
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* ──── Right: Server Status Panel ──── */}
                    <div className="self-start lg:sticky lg:top-8">
                        <Panel
                            label="SERVER STATUS"
                            footer={
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="border border-lime/30 px-2.5 py-1 text-[9px] tracking-[0.25em] text-lime">
                                            LIVE
                                        </span>
                                        <span className="text-[9px] tracking-[0.15em] text-neutral-800">
                                            all systems operational
                                        </span>
                                    </div>
                                </div>
                            }
                        >
                            <Panel.Rows>
                                <Panel.Row
                                    label="REGION"
                                    value="US-EAST"
                                />
                                <Panel.Row
                                    label="PLAYERS ONLINE"
                                    value="347 active"
                                    accent
                                />
                                <Panel.Row
                                    label="MATCHES LIVE"
                                    value="28 in progress"
                                />
                            </Panel.Rows>
                        </Panel>

                        {/* Decorative text below panel */}
                        <p className="mt-4 text-[9px] tracking-[0.2em] text-neutral-800">
                            LOGIN / RETURNING PLAYER / SESSION
                        </p>
                    </div>
                </div>
            </div>

            <Footer label="LOGIN" />
        </main>
    );
}
