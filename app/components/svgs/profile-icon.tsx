type ProfileIconProps = {
    className?: string;
    title?: string;
};

export function ProfileIcon({ className, title = "Profile" }: ProfileIconProps) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={title ? undefined : true}
            role={title ? "img" : undefined}
            className={className}
        >
            {title ? <title>{title}</title> : null}
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
    );
}
