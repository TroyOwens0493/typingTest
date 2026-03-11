import { useState } from "react";
import { Form } from "react-router";
import { Nav } from "~/components/nav";
import { InputField } from "~/components/input-field";
import { Panel } from "~/components/panel";
import { Footer } from "~/components/footer";

/*
 * Mock data — replace with real data once the API / data layer is wired up.
 */
const ACCOUNT = {
    displayName: "ghostkey_",
    email: "ghost@royaltype.gg",
    rank: "DIAMOND III",
    level: 42,
    memberSince: "2025-03-14",
};

/* ─── Setting Row (read-only field display) ─── */
function SettingRow({
    label,
    value,
    accent,
    mono,
}: {
    label: string;
    value: string;
    accent?: boolean;
    mono?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4 px-4 py-3.5 sm:px-5">
            <span className="shrink-0 text-[9px] tracking-[0.3em] text-neutral-700">
                {label}
            </span>
            <span
                className={`text-right text-xs ${mono ? "tabular-nums" : ""} ${accent ? "text-lime" : "text-neutral-400"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   PROFILE VIEW
   ═══════════════════════════════════════════════════════ */
export function Profile() {
    /* Display name inline-edit state */
    const [isEditingName, setIsEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(ACCOUNT.displayName);
    const [nameInput, setNameInput] = useState(ACCOUNT.displayName);

    /* Password form state */
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    /* Delete confirmation state */
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    function handleSaveName() {
        if (nameInput.trim()) {
            setDisplayName(nameInput.trim());
        }
        setIsEditingName(false);
    }

    function handleCancelName() {
        setNameInput(displayName);
        setIsEditingName(false);
    }

    function handlePasswordSubmit() {
        // TODO: wire up to API
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    }

    const passwordsMatch =
        newPassword.length > 0 && newPassword === confirmPassword;
    const canSubmitPassword =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        passwordsMatch;

    const memberDate = new Date(ACCOUNT.memberSince).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" }
    );

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
                {/* Page header */}
                <div className="mb-12">
                    <p className="mb-4 text-[11px] tracking-[0.3em] text-lime">
                        &gt; ACCOUNT
                        <span className="animate-blink">_</span>
                    </p>

                    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-tight text-white">
                        Profile
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                        Manage your account settings, and update your credentials.
                    </p>
                </div>

                {/* ─── Two-column layout ─── */}
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
                    {/* ──── Left: Account Settings ──── */}
                    <div className="space-y-12">
                        {/* ── Account Details ── */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                ACCOUNT DETAILS
                            </p>

                            <div className="border border-neutral-800/80 bg-[#0a0a0a]">
                                {/* Display Name */}
                                <div className="border-b border-neutral-800/50 px-5 py-5">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-[9px] tracking-[0.3em] text-neutral-700">
                                            DISPLAY NAME
                                        </span>
                                        {!isEditingName && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsEditingName(true)
                                                }
                                                className="text-[9px] tracking-[0.2em] text-neutral-700 transition-colors hover:text-lime"
                                            >
                                                EDIT
                                            </button>
                                        )}
                                    </div>

                                    {isEditingName ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={nameInput}
                                                onChange={(e) =>
                                                    setNameInput(e.target.value)
                                                }
                                                className="w-full border border-lime/40 bg-transparent px-3 py-2.5 text-sm tracking-wide text-white outline-none"
                                            />
                                            <div className="mt-3 flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveName}
                                                    disabled={
                                                        !nameInput.trim()
                                                    }
                                                    className="bg-lime px-5 py-2 text-[10px] font-bold tracking-[0.15em] text-black transition-colors hover:bg-[#d4ff4d] disabled:opacity-40"
                                                >
                                                    SAVE
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelName}
                                                    className="px-4 py-2 text-[10px] tracking-[0.15em] text-neutral-600 transition-colors hover:text-white"
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsEditingName(true)
                                            }
                                            className="group flex items-center gap-3"
                                        >
                                            <span className="text-sm tracking-wide text-white transition-colors group-hover:text-lime">
                                                {displayName}
                                            </span>
                                            <span className="text-[9px] text-neutral-800 transition-colors group-hover:text-neutral-600">
                                                &#9998;
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="border-b border-neutral-800/50 px-5 py-5">
                                    <span className="mb-2 block text-[9px] tracking-[0.3em] text-neutral-700">
                                        EMAIL
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm tracking-wide text-neutral-400">
                                            {ACCOUNT.email}
                                        </span>
                                        <span className="border border-neutral-800 px-2 py-0.5 text-[8px] tracking-[0.2em] text-neutral-700">
                                            VERIFIED
                                        </span>
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div className="px-5 py-5">
                                    <span className="mb-2 block text-[9px] tracking-[0.3em] text-neutral-700">
                                        MEMBER SINCE
                                    </span>
                                    <span className="text-sm tabular-nums tracking-wide text-neutral-500">
                                        {memberDate}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* ── Security ── */}
                        <section>
                            <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                SECURITY
                            </p>

                            <Panel label="CHANGE PASSWORD">
                                <div className="space-y-5 px-5 py-5">
                                    <InputField
                                        label="CURRENT PASSWORD"
                                        type="password"
                                        value={currentPassword}
                                        onChange={setCurrentPassword}
                                        placeholder="••••••••••••"
                                    />
                                    <InputField
                                        label="NEW PASSWORD"
                                        type="password"
                                        value={newPassword}
                                        onChange={setNewPassword}
                                        placeholder="minimum 8 characters"
                                    />
                                    <InputField
                                        label="CONFIRM NEW PASSWORD"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        placeholder="re-enter new password"
                                    />

                                    {/* Password match indicator */}
                                    {confirmPassword.length > 0 && (
                                        <p
                                            className={`text-[10px] tracking-[0.15em] ${passwordsMatch
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
                                            onClick={handlePasswordSubmit}
                                            disabled={!canSubmitPassword}
                                            className="bg-lime px-6 py-3 text-[10px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            UPDATE PASSWORD
                                        </button>
                                        <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-800">
                                            {
                                                "// you will need to sign in again after changing your password"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </Panel>
                        </section>

                        {/* ── Session ── */}
                        <Form method="post" className="space-y-5 px-5 py-5">
                            <section>
                                <p className="mb-5 text-[9px] tracking-[0.3em] text-neutral-700">
                                    SESSION
                                </p>

                                <button
                                    type="submit"
                                    className="w-full border border-neutral-800/80 bg-[#0a0a0a] px-5 py-4 text-[11px] tracking-[0.2em] text-neutral-500 transition-all hover:border-neutral-700 hover:text-white sm:w-auto"
                                >
                                    SIGN OUT &rarr;
                                </button>
                                <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-800">
                                    {"// end your current session"}
                                </p>
                            </section>
                        </Form>
                    </div>

                    {/* ──── Right: Account Summary Panel ──── */}
                    <div className="self-start lg:sticky lg:top-8">
                        <Panel
                            label="ACCOUNT OVERVIEW"
                        >
                            {/* Account summary rows */}
                            <div className="divide-y divide-neutral-800/50">
                                {/* Avatar / identity block */}
                                <div className="px-4 py-5 sm:px-5">
                                    <div className="flex h-12 w-12 items-center justify-center border border-neutral-800 bg-[#050505] font-display text-lg font-bold text-lime">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="mt-3 font-display text-lg font-bold tracking-tight text-white">
                                        {displayName}
                                    </p>
                                    <p className="mt-1 text-[11px] tracking-wide text-neutral-600">
                                        {ACCOUNT.email}
                                    </p>
                                </div>

                                <SettingRow
                                    label="RANK"
                                    value={ACCOUNT.rank}
                                    accent
                                />
                                <SettingRow
                                    label="LEVEL"
                                    value={`LVL ${ACCOUNT.level}`}
                                    mono
                                />
                                <SettingRow
                                    label="MEMBER SINCE"
                                    value={memberDate}
                                    mono
                                />
                            </div>
                        </Panel>

                        {/* ── Danger Zone ── */}
                        <Panel label="DANGER ZONE" variant="danger" className="mt-6">
                            <div className="px-5 py-5">
                                <p className="mb-4 text-[11px] leading-relaxed text-neutral-700">
                                    Permanently delete your account and all
                                    associated data. This action cannot be
                                    undone.
                                </p>

                                {!deleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm(true)}
                                        className="border border-red-400/30 px-5 py-2.5 text-[10px] tracking-[0.2em] text-red-400/60 transition-all hover:border-red-400/60 hover:text-red-400"
                                    >
                                        DELETE ACCOUNT
                                    </button>
                                ) : (
                                    <div>
                                        <p className="mb-3 text-[10px] tracking-[0.1em] text-red-400/70">
                                            {
                                                "// are you sure? this is irreversible."
                                            }
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                className="bg-red-400/80 px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] text-black transition-colors hover:bg-red-400"
                                            >
                                                CONFIRM DELETE
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteConfirm(false)
                                                }
                                                className="px-4 py-2.5 text-[10px] tracking-[0.15em] text-neutral-600 transition-colors hover:text-white"
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Panel>

                        {/* Decorative text below panels */}
                        <p className="mt-4 text-[9px] tracking-[0.2em] text-neutral-800">
                            {displayName.toUpperCase()} / {ACCOUNT.rank} / LVL{" "}
                            {ACCOUNT.level}
                        </p>
                    </div>
                </div>
            </div>

            <Footer label="PROFILE" />
        </main >
    );
}
