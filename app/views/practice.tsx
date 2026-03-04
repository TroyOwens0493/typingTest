import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import type { TypingWord } from "~/models/typingTypes";
import { TypingTestComponent } from "~/components/typing-test-component";

/*
 * Sample words for the typing area.
 * Each word has a visual state for the static mockup:
 *   "active"    — currently being typed (white, with per-char progress)
 *   "pending"   — not yet reached (very dim)
 * Each word has a status once typed:
 *   "correct"   — typed correctly (dimmed)
 *   "incorrect" — typed with errors (red)
 */
const Words = [
    // Row of already-typed words
    { text: "the", state: "active", typed: "" },
    { text: "quick", state: "pending", typed: "" },
    { text: "brown", state: "pending", typed: "" },
    { text: "fox", state: "pending", typed: "" },
    { text: "jumps", state: "pending", typed: "" },
    { text: "over", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "lazy", state: "pending", typed: "" },
    { text: "dog", state: "pending", typed: "" },
    { text: "while", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "bright", state: "pending", typed: "" },
    { text: "sun", state: "pending", typed: "" },
    { text: "sets", state: "pending", typed: "" },
    { text: "behind", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "distant", state: "pending", typed: "" },
    { text: "mountains", state: "pending", typed: "" },
    { text: "casting", state: "pending", typed: "" },
    { text: "long", state: "pending", typed: "" },
    { text: "shadows", state: "pending", typed: "" },
    { text: "across", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "valley", state: "pending", typed: "" },
    { text: "below", state: "pending", typed: "" },
    { text: "where", state: "pending", typed: "" },
    { text: "rivers", state: "pending", typed: "" },
    { text: "wind", state: "pending", typed: "" },
    { text: "through", state: "pending", typed: "" },
    { text: "ancient", state: "pending", typed: "" },
    { text: "forests", state: "pending", typed: "" },
    { text: "and", state: "pending", typed: "" },
    { text: "forgotten", state: "pending", typed: "" },
    { text: "trails", state: "pending", typed: "" },
    { text: "lead", state: "pending", typed: "" },
    { text: "nowhere", state: "pending", typed: "" },
    { text: "in", state: "pending", typed: "" },
    { text: "particular", state: "pending", typed: "" },
    { text: "just", state: "pending", typed: "" },
    { text: "deeper", state: "pending", typed: "" },
    { text: "into", state: "pending", typed: "" },
    { text: "the", state: "pending", typed: "" },
    { text: "unknown", state: "pending", typed: "" },
] as TypingWord[];

export function Practice() {
    return (
        <main className="relative flex h-screen flex-col overflow-hidden bg-[#050505] font-mono text-neutral-400">
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

            {/* Main content — vertically centered */}
            <TypingTestComponent words={Words} />

            <Footer label="PRACTICE" />
        </main>
    );
}
