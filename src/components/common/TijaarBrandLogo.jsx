/**
 * Tijaar wordmark with transparent background (no white box from raster assets).
 * Mirrors tijaar-app/lib/shared/widgets/tijaar_brand_logo.dart
 */
export default function TijaarBrandLogo({ height = 44, className = "" }) {
  const h = Math.min(Math.max(height, 20), 140);
  const mono = h * 0.92;
  const gap = mono * 0.22;
  const tjFont = mono * 0.42;
  const wordFont = mono * 0.52;
  const radius = mono * 0.26;

  return (
    <span
      className={`inline-flex items-center shrink-0 ${className}`}
      style={{ height: h, gap }}
      aria-label="Tijaar"
    >
      <span
        className="inline-flex items-center justify-center shrink-0 text-white font-black leading-none"
        style={{
          width: mono,
          height: mono,
          borderRadius: radius,
          fontSize: tjFont,
          background: "linear-gradient(135deg, #0d6fa8 0%, #1790d7 100%)",
          boxShadow: `0 ${mono * 0.04}px ${mono * 0.15}px rgba(23, 144, 215, 0.22)`,
        }}
      >
        TJ
      </span>
      <span
        className="font-black leading-none tracking-tight text-shine"
        style={{ fontSize: wordFont }}
      >
        TIJAAR
      </span>
    </span>
  );
}
