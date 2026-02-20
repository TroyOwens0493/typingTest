import type { ReactNode } from "react";

type CardProps = {
    title?: string;
    eyebrow?: string;
    children?: ReactNode;
    className?: string;
};

export function Card({ title, eyebrow, children, className }: CardProps) {
    return (
        <div
            className={[
                "group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-white/2 p-6 text-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur",
                "transition duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.85)]",
                "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition before:duration-300 before:content-['']",
                "before:bg-[radial-gradient(600px_circle_at_0%_0%,rgba(255,255,255,0.08),transparent_40%)]",
                "group-hover:before:opacity-100",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {eyebrow ? (
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                    {eyebrow}
                </p>
            ) : null}
            {title ? (
                <h3 className="mt-2 text-xl font-semibold text-white/95">
                    {title}
                </h3>
            ) : null}
            {children ? (
                <div className="mt-3 text-sm leading-6 text-white/70">
                    {children}
                </div>
            ) : null}
        </div>
    );
}
