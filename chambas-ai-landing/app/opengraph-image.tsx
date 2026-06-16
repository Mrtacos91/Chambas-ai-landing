import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_URL, SITE_LOCALE } from "@/lib/seo/config";

export const alt = "Jalector - Captación de candidatos por WhatsApp con panel ejecutivo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #020617 60%, #022c22 100%)",
          fontFamily: "sans-serif",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 28,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              color: "#022c22",
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            J
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, fontSize: 30 }}>{SITE_NAME}</span>
            <span
              style={{
                fontSize: 13,
                color: "#34d399",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Captación conversacional · Panel ejecutivo
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Capta candidatos por WhatsApp. Decide desde tu panel.
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: "#cbd5e1",
              maxWidth: 900,
            }}
          >
            Un chatbot entrevista a tus aspirantes en 3 minutos, valida los
            datos clave y entrega cada perfil listo para contratar.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#94a3b8",
            letterSpacing: "0.06em",
          }}
        >
          <span>{SITE_URL}</span>
          <span>{SITE_LOCALE.toUpperCase()}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
