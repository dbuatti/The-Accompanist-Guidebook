import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = `${SITE_NAME}: a video course for musical theatre performers`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1E3360";
const PERIWINKLE = "#777CAE";
const BLUE = "#356DA8";
const MAUVE = "#C8ABC2";

async function loadFont(name: string) {
  const buffer = await readFile(join(process.cwd(), "src", "app", "fonts", name));
  return buffer;
}

export default async function Image() {
  const [playfair, inter] = await Promise.all([loadFont("playfair-700.ttf"), loadFont("inter-600.ttf")]);

  const headshot = await readFile(join(process.cwd(), "public", "headshot.jpeg")).catch(() => null);
  const headshotDataUrl = headshot ? `data:image/jpeg;base64,${headshot.toString("base64")}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundImage:
            "radial-gradient(circle at 85% -10%, rgba(53,109,168,0.35) 0%, rgba(53,109,168,0) 55%), radial-gradient(circle at -10% 110%, rgba(200,171,194,0.25) 0%, rgba(200,171,194,0) 50%)",
          backgroundColor: NAVY,
          color: "#fff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", flex: 1, alignItems: "center", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: MAUVE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                ♪
              </div>
              <div style={{ display: "flex", fontSize: 22, color: PERIWINKLE, letterSpacing: 2, fontWeight: 700 }}>
                THE {SITE_NAME.toUpperCase()}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 64, fontFamily: "Playfair", fontWeight: 700, lineHeight: 1.1, maxWidth: 620 }}>
              Walk into your audition prepared, calm, and in control.
            </div>
            <div style={{ display: "flex", fontSize: 26, color: MAUVE, marginTop: 24, maxWidth: 600, lineHeight: 1.4 }}>
              A video course for musical theatre performers. Choose songs, cut and prepare music, set tempo, and collaborate with the pianist and panel.
            </div>
          </div>
          {headshotDataUrl && (
            <div
              style={{
                width: 320,
                height: 320,
                borderRadius: 9999,
                border: "8px solid rgba(200,171,194,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img src={headshotDataUrl} width={304} height={304} style={{ objectFit: "cover", borderRadius: 9999 }} />
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${PERIWINKLE}44`,
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 21, color: "#fff", fontFamily: "Inter", fontWeight: 600 }}>
            Daniele Buatti
          </div>
          <div style={{ display: "flex", fontSize: 19, color: PERIWINKLE, fontFamily: "Inter" }}>
            Pianist · Music Director · Vocal Coach
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: playfair, weight: 700 as const },
        { name: "Inter", data: inter, weight: 600 as const },
      ],
    }
  );
}
