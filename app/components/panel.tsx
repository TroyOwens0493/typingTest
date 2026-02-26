import type { ReactNode } from "react";

/* ─── Panel Root ─── */
function PanelRoot({
    label,
    headerRight,
    footer,
    children,
    variant = "default",
    active = true,
    className,
}: {
    label: string;
    headerRight?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    variant?: "default" | "danger";
    active?: boolean;
    className?: string;
}) {
    const isDanger = variant === "danger";

    const outerBorder = isDanger
        ? "border-red-400/20"
        : active
            ? "border-neutral-800/80"
            : "border-neutral-800/40";

    const headerBorder = isDanger
        ? "border-red-400/10"
        : "border-neutral-800/80";

    const dotClass = isDanger
        ? "bg-red-400/60"
        : active
            ? "bg-lime animate-pulse-slow"
            : "bg-neutral-700";

    const labelColor = isDanger
        ? "text-red-400/50"
        : "text-neutral-600";

    return (
        <div
            className={`border bg-[#0a0a0a] transition-all ${outerBorder} ${!active && !isDanger ? "opacity-50" : ""} ${className ?? ""}`}
        >
            {/* Header */}
            <div
                className={`flex items-center justify-between border-b ${headerBorder} px-4 py-3 sm:px-5`}
            >
                <div className="flex items-center gap-2.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                    <span
                        className={`text-[10px] tracking-[0.3em] ${labelColor}`}
                    >
                        {label}
                    </span>
                </div>
                {headerRight}
            </div>

            {/* Body */}
            {children}

            {/* Footer */}
            {footer && (
                <div
                    className={`border-t ${isDanger ? "border-red-400/10" : "border-neutral-800/80"}`}
                >
                    {footer}
                </div>
            )}
        </div>
    );
}

/* ─── Panel.Rows ─── */
function Rows({ children }: { children: ReactNode }) {
    return (
        <div className="divide-y divide-neutral-800/50">
            {children}
        </div>
    );
}

/* ─── Panel.Row ─── */
function Row({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="px-4 py-4 sm:px-5">
            <span className="text-[9px] tracking-[0.3em] text-neutral-700">
                {label}
            </span>
            <p
                className={`mt-1.5 text-xs ${
                    accent ? "text-lime" : "text-neutral-400"
                }`}
            >
                {value}
            </p>
        </div>
    );
}

/* ─── Compound Export ─── */
export const Panel = Object.assign(PanelRoot, {
    Rows,
    Row,
});
