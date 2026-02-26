import { useState } from "react";
import { Link } from "react-router";
import { Logo } from "~/components/logo";
import { InputField } from "~/components/input-field";
import { Panel } from "~/components/panel";

export function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordsMatch =
        confirmPassword.length > 0 && password === confirmPassword;
    const passwordLongEnough = password.length >= 8;
    const canSubmit =
        email.length > 0 && passwordLongEnough && passwordsMatch;

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
                        to="/login"
                        className="px-4 py-2 text-[11px] tracking-[0.15em] text-neutral-600 transition-colors hover:text-white"
                    >
                        LOG IN
                    </Link>
                </div>
            </header>

            {/* ─── Content ─── */}
            <div className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-10 lg:px-12 lg:pt-16">
                {/* Page header */}
                <div className="mb-12">
                    <p className="mb-4 text-[11px] tracking-[0.3em] text-lime">
                        &gt; CREATE ACCOUNT
                        <span className="animate-blink">_</span>
                    </p>

                    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-tight text-white">
                        Join the arena.
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                        Sign up to create lobbies, climb the leaderboard,
                        and prove you&rsquo;re the fastest in the lobby.
                    </p>
                </div>

                {/* ─── Two-column layout ─── */}
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
                    {/* ──── Left: Sign Up Form ──── */}
                    <div className="space-y-12">
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                CREDENTIALS
                            </p>

                            <Panel
                                label="NEW PLAYER"
                                headerRight={
                                    <span className="text-[10px] tracking-[0.2em] text-neutral-800">
                                        PERSONAL INFO
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
                                        placeholder="minimum 8 characters"
                                    />
                                    <InputField
                                        label="CONFIRM PASSWORD"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        placeholder="re-enter password"
                                    />

                                    {/* Password validation hints */}
                                    {password.length > 0 && !passwordLongEnough && (
                                        <p className="text-[10px] tracking-[0.15em] text-red-400/80">
                                            {"// password must be at least 8 characters"}
                                        </p>
                                    )}
                                    {confirmPassword.length > 0 && (
                                        <p
                                            className={`text-[10px] tracking-[0.15em] ${
                                                passwordsMatch
                                                    ? "text-lime/70"
                                                    : "text-red-400/80"
                                            }`}
                                        >
                                            {passwordsMatch
                                                ? "// passwords match"
                                                : "// passwords do not match"}
                                        </p>
                                    )}

                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={!canSubmit}
                                            className="w-full bg-lime py-3.5 text-[11px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:px-8"
                                        >
                                            CREATE ACCOUNT
                                        </button>
                                        <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-800">
                                            {"// you'll be redirected to the lobby"}
                                        </p>
                                    </div>
                                </div>
                            </Panel>
                        </section>

                        {/* Already have an account */}
                        <div>
                            <p className="text-[11px] tracking-[0.1em] text-neutral-600">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="tracking-[0.15em] text-neutral-400 transition-colors hover:text-lime"
                                >
                                    LOG IN &rarr;
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* ──── Right: Info Panel ──── */}
                    <div className="self-start lg:sticky lg:top-8">
                        <Panel
                            label="INTEL"
                            footer={
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="border border-lime/30 px-2.5 py-1 text-[9px] tracking-[0.25em] text-lime">
                                            FREE
                                        </span>
                                        <span className="text-[9px] tracking-[0.15em] text-neutral-800">
                                            no credit card required
                                        </span>
                                    </div>
                                </div>
                            }
                        >
                            <Panel.Rows>
                                <Panel.Row
                                    label="BATTLE FORMATS"
                                    value="Elimination, points, and instant-fail modes"
                                />
                                <Panel.Row
                                    label="PRIVATE LOBBIES"
                                    value="Create and share invite codes with friends"
                                />
                                <Panel.Row
                                    label="PLAYER STATS"
                                    value="WPM, accuracy, and match history tracked"
                                />
                            </Panel.Rows>
                        </Panel>

                        {/* Decorative text below panel */}
                        <p className="mt-4 text-[9px] tracking-[0.2em] text-neutral-800">
                            SIGNUP / NEW PLAYER / ALL ACCESS
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom decorative bar */}
            <div className="relative z-10 mt-auto flex items-center justify-between border-t border-neutral-800/50 px-6 py-3 lg:px-12">
                <span className="text-[9px] tracking-[0.3em] text-neutral-800">
                    ROYAL<span className="text-lime/30">TYPE</span>
                    {" // SIGNUP"}
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
