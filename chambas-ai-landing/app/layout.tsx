import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jalector.com"),
  title: {
    default: "Chambas AI — Reclutamiento Inteligente por WhatsApp",
    template: "%s | Chambas AI",
  },
  description:
    "Contrata el mejor talento tecnológico con IA conversacional en WhatsApp. Sin formularios. Filtra miles de candidatos en segundos y recibe solo los perfiles que encajan — directo en tu chat.",
  keywords: [
    "reclutamiento por whatsapp",
    "bot de reclutamiento ia",
    "inteligencia artificial reclutamiento",
    "contratar por whatsapp mexico",
    "agente ia recursos humanos",
    "software reclutamiento startups",
    "chambas ai",
    "jalector",
    "headhunter automatico ia",
    "filtro de candidatos inteligente",
    "reclutamiento automatizado latam",
    "ats whatsapp",
  ],
  authors: [{ name: "Chambas AI", url: "https://jalector.com" }],
  creator: "Chambas AI",
  publisher: "Chambas AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://jalector.com",
    siteName: "Chambas AI",
    title: "Chambas AI — Reclutamiento Inteligente por WhatsApp",
    description:
      "Contrata el mejor talento tecnológico con IA conversacional en WhatsApp. Sin formularios. Filtra miles de candidatos en segundos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chambas AI — Reclutamiento Inteligente por WhatsApp con Inteligencia Artificial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chambas AI — Reclutamiento Inteligente por WhatsApp",
    description:
      "Contrata el mejor talento tecnológico con IA conversacional en WhatsApp. Sin formularios. Filtra miles de candidatos en segundos.",
    images: ["/og-image.png"],
    creator: "@chambas_ai",
  },
  alternates: {
    canonical: "https://jalector.com",
    languages: {
      "es-MX": "https://jalector.com",
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://jalector.com/#organization",
      name: "Chambas AI",
      url: "https://jalector.com",
      logo: {
        "@type": "ImageObject",
        url: "https://jalector.com/logo.png",
        width: 180,
        height: 40,
      },
      description:
        "Plataforma de reclutamiento con inteligencia artificial que opera a través de WhatsApp. Filtra candidatos, evalúa perfiles y agenda entrevistas de forma conversacional.",
    },
    {
      "@type": "WebSite",
      "@id": "https://jalector.com/#website",
      url: "https://jalector.com",
      name: "Chambas AI",
      publisher: { "@id": "https://jalector.com/#organization" },
      inLanguage: "es-MX",
    },
    {
      "@type": "WebPage",
      "@id": "https://jalector.com/#webpage",
      url: "https://jalector.com",
      name: "Chambas AI — Reclutamiento Inteligente por WhatsApp",
      isPartOf: { "@id": "https://jalector.com/#website" },
      about: { "@id": "https://jalector.com/#organization" },
      description:
        "Contrata el mejor talento tecnológico con IA conversacional en WhatsApp. Sin formularios. Filtra miles de candidatos en segundos y recibe solo los perfiles que encajan.",
      inLanguage: "es-MX",
    },
    {
      "@type": "SoftwareApplication",
      name: "Chambas AI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, WhatsApp",
      url: "https://jalector.com",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "MXN",
        description: "Plan gratuito disponible",
      },
      description:
        "Agente de reclutamiento con IA que filtra candidatos y gestiona el proceso de contratación a través de conversaciones en WhatsApp.",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cómo funciona el reclutamiento por WhatsApp con Chambas AI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Describes el perfil que buscas en lenguaje natural a través de WhatsApp. Chambas AI analiza miles de candidatos en segundos y te presenta los que mejor encajan, con un score de compatibilidad y resumen ejecutivo.",
          },
        },
        {
          "@type": "Question",
          name: "¿Chambas AI reemplaza a un reclutador humano?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Chambas AI automatiza el proceso de screening y primera selección, permitiendo que tu equipo se enfoque en entrevistas de fondo y cierre de ofertas. Funciona como un headhunter disponible 24/7.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto tiempo toma contratar con Chambas AI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El tiempo promedio de contratación con Chambas AI es de 48 horas, desde la primera búsqueda hasta la presentación de candidatos calificados.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
