import type { Metadata } from "next";
import InfoPage from "../info-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Estado del servicio",
  description:
    "Estado operativo de los canales de Jalector, plataforma de captación de candidatos por WhatsApp con panel ejecutivo.",
  path: "/status",
});

export default function StatusPage() {
  return (
    <InfoPage
      eyebrow="Servicio"
      title="Estado del servicio"
      description="Vista general del estado operativo de los canales públicos de Jalector."
      sections={[
        {
          title: "Sitio web",
          body: "Operativo. La landing pública y las páginas informativas están disponibles.",
        },
        {
          title: "Canal de WhatsApp",
          body: "Operativo. Las respuestas pueden variar según disponibilidad del equipo comercial y proveedores externos.",
        },
        {
          title: "Actualizaciones",
          body: "Cualquier mantenimiento relevante será comunicado por los canales oficiales de Jalector.",
        },
      ]}
    />
  );
}
