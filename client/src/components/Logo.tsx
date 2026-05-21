export function UpsellLogo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="u-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <g filter="url(#glow)">
                {/* The 'U' shape */}
                <path
                    d="M 26 30 L 26 60 C 26 84, 74 84, 74 60 L 74 34"
                    stroke="url(#u-gradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* The upward arrow on the right side of the 'U' */}
                <path
                    d="M 56 36 L 74 18 L 92 36"
                    stroke="url(#u-gradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    )
}
