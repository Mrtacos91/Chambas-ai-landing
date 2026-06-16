import type { Metadata } from "next";
import InfoPage from "../info-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Jalector. Cómo tratamos los datos de candidatos y empresas en nuestra plataforma de captación de candidatos con WhatsApp.",
  path: "/aviso-de-privacidad",
});

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Aviso de privacidad"
      description="Resumen de cómo Jalector trata información de contacto, operación y candidatos dentro de sus flujos de reclutamiento."
      sections={[
        {
          title: "Datos que podemos procesar",
          body: "Podemos recibir datos de contacto, información profesional, mensajes de reclutamiento y señales operativas necesarias para responder solicitudes, calificar perfiles y dar seguimiento a procesos.",
        },
        {
          title: "Finalidad",
          body: "La información se usa para operar el servicio, responder comunicaciones, generar shortlists, mejorar la calidad del producto y cumplir obligaciones legales aplicables.",
        },
        {
          title: "Derechos y contacto",
          body: "Para consultas de privacidad, actualización o eliminación de datos, escribe a hola@jalector.com. Revisaremos cada solicitud conforme a la normativa aplicable.",
        },
      ]}
    />
  );
}
