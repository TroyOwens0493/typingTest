import { useCallback } from "react";

/* ─── Input Field ─── */
export function InputField({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    disabled,
    readOnly,
    hideLabel,
    focusOnMount,
    inputClassName,
    onKeyDown,
    onBlur,
    onFocus,
}: {
    label: string;
    type?: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    hideLabel?: boolean;
    /** Focus the input when it mounts */
    focusOnMount?: boolean;
    inputClassName?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
    const id = label.toLowerCase().replace(/\s+/g, "-");

    const inputRef = useCallback(
        (node: HTMLInputElement | null) => {
            if (node && focusOnMount) {
                node.focus();
            }
        },
        [focusOnMount],
    );

    return (
        <div>
            <label
                htmlFor={id}
                className={
                    hideLabel
                        ? "sr-only"
                        : "mb-2 block text-[9px] tracking-[0.3em] text-neutral-700"
                }
            >
                {label}
            </label>
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                onFocus={onFocus}
                className={`w-full border bg-[#0a0a0a] px-4 py-3 text-xs tracking-wide text-neutral-300 outline-none transition-all placeholder:text-neutral-800 ${
                    readOnly || disabled
                        ? "cursor-default border-neutral-800/50 text-neutral-600"
                        : "border-neutral-800/80 focus:border-lime/40 focus:text-white"
                } ${inputClassName ?? ""}`}
            />
        </div>
    );
}
