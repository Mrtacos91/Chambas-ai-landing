import type { Metadata } from "next";
import JalectorLanding from "./jalector-landing";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Captación de candidatos por WhatsApp con panel ejecutivo",
  description:
    "Jalector capta candidatos por WhatsApp con un chatbot que entrevista en 3 minutos y entrega cada perfil en tu panel ejecutivo. Diseñado para retail, restaurantes, logística y back office.",
  path: "/",
  keywords: [
    "jalector",
    "captacion de candidatos por whatsapp",
    "chatbot de reclutamiento",
    "panel de candidatos",
    "reclutamiento por whatsapp",
    "seleccion de personal con whatsapp",
    "reclutamiento cajeros repartidores meseros",
    "alternativa occ computrabajo indeed linkedin",
    "reclutamiento mexico",
    "screening automatizado de candidatos",
  ],
});

export default function Home() {
  return <JalectorLanding />;
}
