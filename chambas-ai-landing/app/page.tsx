import type { Metadata } from "next";
import JalectorLanding from "./jalector-landing";

export const metadata: Metadata = {
  title: "Captación de candidatos por WhatsApp con panel ejecutivo",
  description:
    "Jalector capta candidatos por WhatsApp con un chatbot que entrevista en 3 minutos y entrega cada perfil en tu panel ejecutivo. Diseñado para retail, restaurantes, logística y back office.",
  alternates: {
    canonical: "https://jalector.com",
  },
};

export default function Home() {
  return <JalectorLanding />;
}
