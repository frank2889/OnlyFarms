import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${BRAND.name}. Je boodschappenlijst, vers van de lokale producent`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Kleurwaarden gespiegeld uit de tokens in src/app/globals.css (terra-500,
// cream-50, ink-900): ImageResponse kan geen CSS-variabelen lezen. Bij een
// paletwissel deze waarden mee laten lopen.
const TERRA = "#c4552c";
const CREAM = "#fdfaf5";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: TERRA,
          color: CREAM,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>{BRAND.name}</div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.92 }}>{BRAND.tagline}</div>
      </div>
    ),
    size
  );
}
