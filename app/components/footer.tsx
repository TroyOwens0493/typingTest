type FooterProps = {
    label: string;
};

export function Footer({ label }: FooterProps) {
    return (
        <div className="relative z-10 mt-auto flex items-center justify-between border-t border-neutral-800/50 px-6 py-3 lg:px-12">
            <span className="text-[9px] tracking-[0.3em] text-neutral-800">
                ROYAL<span className="text-lime/30">TYPE</span>
                {` // ${label}`}
            </span>
            <div className="flex items-center gap-4">
                <span className="text-[9px] tabular-nums tracking-[0.2em] text-neutral-800">
                    v0.1.0
                </span>
            </div>
        </div>
    );
}
