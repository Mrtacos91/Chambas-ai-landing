import type { Metadata } from "next";
import InfoPage from "../info-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso de Jalector, plataforma de captación de candidatos por WhatsApp y reclutamiento con inteligencia artificial.",
  path: "/terminos",
});

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Términos y condiciones"
      description="Condiciones generales de uso para la experiencia web y los canales de contacto de Jalector."
      sections={[
        {
          title: "Uso del servicio",
          body: "Jalector ofrece herramientas de apoyo para reclutamiento. Las decisiones finales sobre contratación, entrevistas y ofertas corresponden al equipo contratante.",
        },
        {
          title: "Disponibilidad",
          body: "Trabajamos para mantener el servicio disponible, pero pueden existir ventanas de mantenimiento, integraciones externas o interrupciones fuera de nuestro control.",
        },
        {
          title: "Uso responsable",
          body: "Los usuarios deben proporcionar información veraz, respetar derechos de terceros y evitar usos discriminatorios o contrarios a la ley.",
        },
      ]}
    />
  );
}
