import { renderSVG } from "uqr";

// Kleurwaarden gespiegeld uit de tokens in src/app/globals.css (ink-900,
// cream-50): dit genereert een losse SVG-string, geen CSS-variabelen
// beschikbaar (zelfde aanpak als opengraph-image.tsx). Bij een kleurwissel
// hier ook aanpassen.
const INK_900 = "#2a211b";
const CREAM_50 = "#fdfaf5";

/** SVG-QR-code (als string) voor een producent-URL: promotieblok en printbare poster. */
export function producerQrSvg(url: string, pixelSize = 8): string {
  return renderSVG(url, {
    ecc: "M",
    pixelSize,
    blackColor: INK_900,
    whiteColor: CREAM_50,
  });
}
