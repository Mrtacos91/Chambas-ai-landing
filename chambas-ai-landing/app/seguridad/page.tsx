import type { Metadata } from "next";
import InfoPage from "../info-page";

export const metadata: Metadata = {
  title: "Seguridad",
  description:
    "Principios de seguridad de Jalector para la protección de datos en procesos de búsqueda de candidatos y reclutamiento con IA.",
  alternates: {
    canonical: "https://jalector.com/seguridad",
  },
};

export default function SecurityPage() {
  return (
    <InfoPage
      eyebrow="Confianza"
      title="Seguridad"
      description="Principios de seguridad aplicados a los flujos de contacto, datos e integraciones de Jalector."
      sections={[
        {
          title: "Acceso mínimo",
          body: "Diseñamos los flujos para solicitar únicamente la información necesaria para operar el proceso de reclutamiento.",
        },
        {
          title: "Trazabilidad",
          body: "Priorizamos registros operativos claros para dar seguimiento a solicitudes, demos y procesos comerciales.",
        },
        {
          title: "Canales oficiales",
          body: "Para reportes de seguridad o dudas sobre tratamiento de información, utiliza hola@jalector.com.",
        },
      ]}
    />
  );
}
