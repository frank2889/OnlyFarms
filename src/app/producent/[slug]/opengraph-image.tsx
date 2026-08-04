import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { producerBySlug } from "@/lib/queries/producers";

export const revalidate = 300;
export const alt = "Producent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Zelfde tokens als de site-brede og-image (gespiegeld uit globals.css)
const TERRA = "#c4552c";
const CREAM = "#fdfaf5";
const INK = "#292018";

export default async function ProducerOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const producer = await producerBySlug((await params).slug);
  const name = producer?.name ?? BRAND.name;
  const city = producer?.city ?? "";
  const photo = producer?.photos[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: photo ? INK : TERRA,
          color: CREAM,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {photo && (
          <img
            src={photo}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.75,
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 56,
            ...(photo
              ? { background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }
              : {}),
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 36, marginTop: 12, opacity: 0.9 }}>
            {city ? `${city} · ${BRAND.name}` : BRAND.name}
          </div>
        </div>
      </div>
    ),
    size
  );
}
