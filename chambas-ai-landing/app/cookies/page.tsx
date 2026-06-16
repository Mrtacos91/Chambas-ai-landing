import type { Metadata } from "next";
import InfoPage from "../info-page";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Política de cookies de Jalector. Información sobre tecnologías de medición usadas en nuestra plataforma de reclutamiento con IA.",
  alternates: {
    canonical: "https://jalector.com/cookies",
  },
};

export default function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Política de cookies"
      description="Información sobre tecnologías de medición y preferencias usadas en la experiencia de Jalector."
      sections={[
        {
          title: "Preferencias",
          body: "Guardamos preferencias locales, como el modo claro u oscuro, para mejorar la experiencia al volver a visitar el sitio.",
        },
        {
          title: "Analítica",
          body: "Podemos usar medición agregada para entender rendimiento, navegación y conversión, evitando recopilar más información de la necesaria.",
        },
        {
          title: "Control",
          body: "Puedes administrar cookies y almacenamiento local desde la configuración de tu navegador.",
        },
      ]}
    />
  );
}
