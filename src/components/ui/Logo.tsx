import Image from "next/image";

const WHITE_LOGO_SRC = "/logo/logo-white.png";

const LOGO_WIDTH = 3396;
const LOGO_HEIGHT = 1327;

/**
 * Twinity wordmark for dark surfaces (navbar, dark shell).
 * Uses the white @4x asset so it reads on `#0D0D0D` regardless of OS theme.
 */
export default function Logo({ height = 32 }: { height?: number }) {
  return (
    <Image
      src={WHITE_LOGO_SRC}
      alt="Twinity"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      style={{
        objectFit: "contain",
        height: `${height}px`,
        width: "auto",
      }}
      priority
      sizes={`${Math.round((height * LOGO_WIDTH) / LOGO_HEIGHT)}px`}
    />
  );
}
