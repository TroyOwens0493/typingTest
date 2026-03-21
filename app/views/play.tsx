import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import { TypingTestComponent } from "~/components/typing-test-component";
import type { TypingWord } from "~/models/typingTypes";

type PlayProps = {
    words: TypingWord[];
};

export function Play({ words }: PlayProps) {
    return (
        <main className="relative flex h-screen flex-col overflow-hidden bg-[#050505] font-mono text-neutral-400">
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)",
                }}
            />

            <Nav />

            <TypingTestComponent words={words} />

            <Footer label="PLAY" />
        </main>
    );
}
