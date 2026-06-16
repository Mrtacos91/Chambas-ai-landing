import type { Metadata } from "next";
import InfoPage from "../info-page";

export const metadata: Metadata = {
  title: "Centro de ayuda y soporte",
  description:
    "Canales de contacto y soporte para equipos que usan Jalector, la plataforma de búsqueda de empleo y candidatos con IA.",
  alternates: {
    canonical: "https://jalector.com/soporte",
  },
};

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Soporte"
      title="Centro de ayuda"
      description="Canales y tiempos de atención para equipos interesados en usar Jalector."
      sections={[
        {
          title: "Contacto rápido",
          body: "Para solicitudes comerciales o demos, el canal recomendado es WhatsApp desde el botón de contacto de la página principal.",
        },
        {
          title: "Soporte por email",
          body: "Para dudas de privacidad, seguridad o seguimiento operativo, escribe a hola@jalector.com con el contexto de tu solicitud.",
        },
        {
          title: "Horario",
          body: "Atendemos solicitudes comerciales en horario laboral de México y damos prioridad a equipos con procesos activos.",
        },
      ]}
    />
  );
}
