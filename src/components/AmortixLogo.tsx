interface Props {
  size?: number
  wordmark?: boolean
}

export function AmortixMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="amx-g1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00d4aa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="amx-g2" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00d4aa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Outer partial ring — bottom-right arc */}
      <path
        d="M 20 3 A 17 17 0 1 1 6 30"
        stroke="url(#amx-g1)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Intersecting leaf — top-left to bottom-right */}
      <path
        d="M 8 8 C 10 14 10 26 20 20 C 30 14 30 26 32 32"
        stroke="url(#amx-g1)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Intersecting leaf — top-right to bottom-left */}
      <path
        d="M 32 8 C 30 14 30 26 20 20 C 10 14 10 26 8 32"
        stroke="url(#amx-g2)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center highlight dot */}
      <circle cx="20" cy="20" r="2.2" fill="url(#amx-g1)" opacity="0.9" />
    </svg>
  )
}

export function AmortixWordmark({ size = 32 }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <AmortixMark size={size} />
      <span
        style={{ fontSize: size * 0.56, letterSpacing: '-0.02em', lineHeight: 1 }}
        className="font-extrabold"
      >
        <span className="text-ink-primary">AMORTI</span>
        <span style={{ background: 'linear-gradient(135deg,#00d4aa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X</span>
      </span>
    </div>
  )
}
