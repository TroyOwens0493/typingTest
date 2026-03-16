import { useCallback, useEffect, useState } from "react";
import { Form, useFetcher } from "react-router";
import { Nav } from "~/components/nav";
import { InputField } from "~/components/input-field";
import { Panel } from "~/components/panel";
import { Footer } from "~/components/footer";

type ProfileData = {
    displayName: string;
    email: string;
    rank: string;
    level: number;
    memberSince: number;
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
export function Profile({ profile }: { profile: ProfileData }) {
    /* Display name inline-edit state */
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(profile.displayName);
    const nameFetcher = useFetcher<{
        ok?: boolean;
        error?: string;
        displayName?: string;
    }>();
    const nameValidationFetcher = useFetcher<string>();
    const [nameErr, setNameErr] = useState("");

    /* Password form state */
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordFetcher = useFetcher<{
        ok?: boolean;
        error?: string;
    }>();

    /* Delete confirmation state */
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        setNameInput(profile.displayName);
    }, [profile.displayName]);

    useEffect(() => {
        if (nameFetcher.state === "idle" && nameFetcher.data?.ok) {
            setIsEditingName(false);
            setNameErr("");
            setNameInput(nameFetcher.data.displayName ?? profile.displayName);
        }
    }, [nameFetcher.data, nameFetcher.state, profile.displayName]);

    useEffect(() => {
        if (typeof nameValidationFetcher.data === "string") {
            setNameErr(nameValidationFetcher.data);
        }
    }, [nameValidationFetcher.data]);

    function handleCancelName() {
        setNameInput(profile.displayName);
        setIsEditingName(false);
    }

    const validateNameInput = useCallback((nameInput: string) => {
        const trimmedName = nameInput.trim();

        if (!trimmedName) {
            setNameErr("You cannot have an empty username");
            return;
        }

        nameValidationFetcher.submit({
            intent: 'validate-username',
            username: trimmedName,
        }, {
            method: 'post',
            action: '/profile',
        });
    }, [nameValidationFetcher]);

    // Debounce input
    useEffect(() => {
        const timer = setTimeout(() => {
            validateNameInput(nameInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [nameInput, validateNameInput]);

    const passwordsMatch =
        newPassword.length > 0 && newPassword === confirmPassword;
    const canSubmitPassword =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        passwordsMatch &&
        passwordFetcher.state === "idle";

    const memberDate = new Date(profile.memberSince).toLocaleDateString(
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
                                                onClick={() =>
                                                    setIsEditingName(true)
                                                }
                                                className="text-[9px] tracking-[0.2em] text-neutral-700 transition-colors hover:text-lime"
                                                type="button"
                                            >
                                                EDIT
                                            </button>
                                        )}
                                    </div>

                                    {isEditingName ? (
                                        <nameFetcher.Form method="post">
                                            <input
                                                type="hidden"
                                                name="intent"
                                                value="change-username"
                                            />
                                            <div>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={nameInput}
                                                    onChange={(e) =>
                                                        setNameInput(e.target.value)
                                                    }
                                                    className="w-full border border-lime/40 bg-transparent px-3 py-2.5 text-sm tracking-wide text-white outline-none"
                                                />
                                                <div className="mt-3 flex items-center gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            !nameInput.trim() ||
                                                            !!nameErr ||
                                                            nameFetcher.state !== "idle"
                                                        }
                                                        className="bg-lime px-5 py-2 text-[10px] font-bold tracking-[0.15em] text-black transition-colors hover:bg-[#d4ff4d] disabled:opacity-40"
                                                    >
                                                        {nameFetcher.state === "submitting"
                                                            ? "SAVING..."
                                                            : "SAVE"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={nameFetcher.state !== "idle"}
                                                        onClick={handleCancelName}
                                                        className="px-4 py-2 text-[10px] tracking-[0.15em] text-neutral-600 transition-colors hover:text-white"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </div>
                                                {nameErr && (
                                                    <p className="mt-3 text-[10px] tracking-[0.1em] text-red-400/80">
                                                        {nameErr}
                                                    </p>
                                                )}
                                                {nameFetcher.data?.error && (
                                                    <p className="mt-3 text-[10px] tracking-[0.1em] text-red-400/80">
                                                        {nameFetcher.data.error}
                                                    </p>
                                                )}
                                            </div>
                                        </nameFetcher.Form>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsEditingName(true)
                                            }
                                            className="group flex items-center gap-3"
                                        >
                                            <span className="text-sm tracking-wide text-white transition-colors group-hover:text-lime">
                                                {profile.displayName}
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
                                            {profile.email}
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
                                <passwordFetcher.Form method="post">
                                    <input
                                        type="hidden"
                                        name="intent"
                                        value="update-password"
                                    />
                                    <div className="space-y-5 px-5 py-5">
                                        <InputField
                                            label="CURRENT PASSWORD"
                                            type="password"
                                            value={currentPassword}
                                            onChange={setCurrentPassword}
                                            placeholder="••••••••••••"
                                            name="currentPassword"
                                        />
                                        <InputField
                                            label="NEW PASSWORD"
                                            type="password"
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            placeholder="minimum 8 characters"
                                            name="newPassword"
                                        />
                                        <InputField
                                            label="CONFIRM NEW PASSWORD"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            placeholder="re-enter new password"
                                            name="confirmPassword"
                                        />

                                        {newPassword.length > 0 && newPassword.length < 8 && (
                                            <p className="text-[10px] tracking-[0.15em] text-red-400/80">
                                                {"// password must be at least 8 characters"}
                                            </p>
                                        )}

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

                                        {passwordFetcher.data?.error && (
                                            <p className="text-[10px] tracking-[0.15em] text-red-400/80">
                                                {`// ${passwordFetcher.data.error}`}
                                            </p>
                                        )}

                                        <div className="pt-1">
                                            <button
                                                type="submit"
                                                disabled={!canSubmitPassword}
                                                className="bg-lime px-6 py-3 text-[10px] font-bold tracking-[0.2em] text-black transition-colors hover:bg-[#d4ff4d] disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                {passwordFetcher.state === "submitting"
                                                    ? "UPDATING..."
                                                    : "UPDATE PASSWORD"}
                                            </button>
                                            <p className="mt-3 text-[10px] tracking-[0.1em] text-neutral-800">
                                                {
                                                    "// you will need to sign in again after changing your password"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </passwordFetcher.Form>
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
                                    name="intent"
                                    value="logout"
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
                                        {profile.displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="mt-3 font-display text-lg font-bold tracking-tight text-white">
                                        {profile.displayName}
                                    </p>
                                    <p className="mt-1 text-[11px] tracking-wide text-neutral-600">
                                        {profile.email}
                                    </p>
                                </div>

                                <SettingRow
                                    label="RANK"
                                    value={profile.rank}
                                    accent
                                />
                                <SettingRow
                                    label="LEVEL"
                                    value={`LVL ${profile.level}`}
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
                            {profile.displayName.toUpperCase()} / {profile.rank} / LVL{" "}
                            {profile.level}
                        </p>
                    </div>
                </div>
            </div >

            <Footer label="PROFILE" />
        </main >
    );
}
