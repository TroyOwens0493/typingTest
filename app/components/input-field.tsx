/* ─── Input Field ─── */
export function InputField({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    disabled,
    readOnly,
}: {
    label: string;
    type?: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
}) {
    const id = label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-[9px] tracking-[0.3em] text-neutral-700"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                className={`w-full border bg-[#0a0a0a] px-4 py-3 text-xs tracking-wide text-neutral-300 outline-none transition-all placeholder:text-neutral-800 ${
                    readOnly || disabled
                        ? "cursor-default border-neutral-800/50 text-neutral-600"
                        : "border-neutral-800/80 focus:border-lime/40 focus:text-white"
                }`}
            />
        </div>
    );
}
