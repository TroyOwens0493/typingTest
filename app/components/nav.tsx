import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Logo } from "./logo";

const NAV_ITEMS = [
    { label: "HOME", href: "/home" },
    { label: "CREATE MATCH", href: "/create" },
    { label: "JOIN RANDOM", href: "/random" },
    { label: "PRACTICE", href: "/practice" },
];

export function Nav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <header className="relative z-10 font-mono">
            <nav className="flex items-center justify-between px-6 py-6 lg:px-12">
                {/* Logo — left */}
                <Link to="/home" className="relative z-20 shrink-0">
                    <Logo />
                </Link>

                {/* Desktop nav links — absolutely centered */}
                <div className="absolute inset-x-0 hidden justify-center lg:flex">
                    <div className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`group relative px-4 py-2 text-[11px] tracking-[0.15em] transition-colors ${isActive
                                        ? "text-lime"
                                        : "text-neutral-600 hover:text-white"
                                        }`}
                                >
                                    {item.label}
                                    {/* Active indicator dot */}
                                    <span
                                        className={`absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 transition-all ${isActive
                                            ? "bg-lime opacity-100"
                                            : "bg-white opacity-0 group-hover:opacity-20"
                                            }`}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop profile button — right */}
                <button
                    type="button"
                    className="z-1 hidden items-center gap-2 border border-neutral-800 px-5 py-2 text-[11px] tracking-[0.15em] text-white transition-all hover:border-lime hover:text-lime lg:flex"
                >
                    <img
                        src="/profileSvg.svg"
                        alt="profile-icon"
                        aria-hidden="true"
                        className="h-3 w-3"
                    />
                    PROFILE
                </button>

                {/* Mobile hamburger toggle */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="relative z-20 flex h-8 w-8 flex-col items-center justify-center gap-[5px] lg:hidden"
                    aria-label="Toggle menu"
                >
                    <span
                        className={`block h-px w-5 bg-neutral-400 transition-all duration-300 ${menuOpen
                            ? "translate-y-[3px] rotate-45"
                            : ""
                            }`}
                    />
                    <span
                        className={`block h-px w-5 bg-neutral-400 transition-all duration-300 ${menuOpen
                            ? "-translate-y-[3px] -rotate-45"
                            : ""
                            }`}
                    />
                </button>
            </nav>

            {/* Mobile dropdown menu */}
            <div
                className={`absolute inset-x-0 top-full z-10 border-b border-neutral-800/80 bg-[#0a0a0a]/95 backdrop-blur-sm transition-all duration-300 lg:hidden ${menuOpen
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
            >
                <div className="divide-y divide-neutral-800/40 px-6">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 py-4 text-[11px] tracking-[0.2em] transition-colors ${isActive
                                    ? "text-lime"
                                    : "text-neutral-500 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <span className="h-1 w-1 rounded-full bg-lime" />
                                )}
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* Profile link in mobile menu */}
                    <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 py-4 text-[11px] tracking-[0.2em] text-neutral-500 transition-colors hover:text-lime"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <title>Profile</title>
                            <circle cx="12" cy="8" r="4" />
                            <path d="M20 21a8 8 0 1 0-16 0" />
                        </svg>
                        PROFILE
                    </Link>
                </div>
            </div>
        </header>
    );
}
