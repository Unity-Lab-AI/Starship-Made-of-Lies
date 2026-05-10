interface UnityAILabLogoProps {
  readonly size?: number
  readonly title?: string
}

export function UnityAILabLogo({ size = 32, title = 'Unity AI Lab' }: UnityAILabLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="unity-lab-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3acdff" />
          <stop offset="100%" stopColor="#9a3ad0" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#0d1117" stroke="url(#unity-lab-grad)" strokeWidth="2" />
      <path d="M16 38 L32 14 L48 38 L42 38 L32 22 L22 38 Z" fill="url(#unity-lab-grad)" />
      <circle cx="32" cy="44" r="3" fill="#3acdff" />
      <text
        x="32"
        y="58"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="8"
        fill="#9a3ad0"
        letterSpacing="0.1em"
      >
        UNITY AI LAB
      </text>
    </svg>
  )
}
