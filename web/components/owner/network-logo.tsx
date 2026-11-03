import type { Network } from "@/lib/trends";

/**
 * Social network logo tile (inline SVG, offline-safe).
 * Simplified brand glyphs on brand-color tiles — decorative; the adjacent
 * network name carries the accessible label.
 */
export function NetworkLogo({
  network,
  size = 20,
}: {
  network: Network | string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={`Logo de ${network}`}
      className="shrink-0 rounded-[5px]"
    >
      {glyph(network)}
    </svg>
  );
}

function tile(color: string, children: React.ReactNode, key: string) {
  return (
    <g key={key}>
      <rect x="0" y="0" width="24" height="24" rx="5" fill={color} />
      {children}
    </g>
  );
}

function glyph(network: string): React.ReactNode {
  switch (network) {
    case "facebook":
      return tile(
        "#1877F2",
        <text
          x="12"
          y="17.5"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill="#ffffff"
          fontFamily="Helvetica, Arial, sans-serif"
        >
          f
        </text>,
        network
      );
    case "instagram":
      return tile(
        "#E1306C",
        <g fill="none" stroke="#ffffff" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" rx="4" />
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="17" cy="7" r="1.2" fill="#ffffff" stroke="none" />
        </g>,
        network
      );
    case "tiktok":
      return tile(
        "#000000",
        <path
          d="M16.5 3c.4 2.3 1.9 3.8 4.2 4v3c-1.6 0-3-.5-4.2-1.3v6.1c0 3.4-2.4 5.7-5.5 5.7-3 0-5.3-2.2-5.3-5.2 0-3 2.4-5.3 5.6-5.3.3 0 .7 0 1 .1v3.1c-.3-.1-.7-.2-1-.2-1.4 0-2.5 1-2.5 2.3 0 1.2 1 2.2 2.3 2.2 1.4 0 2.4-1 2.4-2.6V3h3z"
          fill="#ffffff"
        />,
        network
      );
    case "whatsapp":
      return tile(
        "#25D366",
        <path
          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
          fill="#ffffff"
        />,
        network
      );
    case "threads":
      return tile(
        "#000000",
        <text
          x="12"
          y="17.5"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="#ffffff"
          fontFamily="Helvetica, Arial, sans-serif"
        >
          @
        </text>,
        network
      );
    case "x":
      return tile(
        "#000000",
        <path
          d="M6.5 5.5l11 13M17.5 5.5l-11 13"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
        />,
        network
      );
    default:
      return tile(
        "#232527",
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#f7f2ea"
          fontFamily="Helvetica, Arial, sans-serif"
        >
          {network.slice(0, 1).toUpperCase()}
        </text>,
        "fallback"
      );
  }
}
