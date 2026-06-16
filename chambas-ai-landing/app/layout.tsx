import type { Metadata } from "next";
import { Geist, Inter_Tight } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jalector.com"),
  title: {
    default: "Jalector | Captación de candidatos por WhatsApp y panel ejecutivo",
    template: "%s | Jalector",
  },
  description:
    "Jalector capta candidatos por WhatsApp con un chatbot que recolecta sus datos en 3 minutos y los entrega listos para contratar en tu panel ejecutivo. Reclutamiento sin formularios, sin CVs en PDF, sin Excel suelto.",
  keywords: [
    "jalector",
    "captaci\u00f3n de candidatos por whatsapp",
    "chatbot de reclutamiento",
    "chatbot reclutador whatsapp",
    "panel de candidatos",
    "ats whatsapp",
    "reclutamiento por whatsapp",
    "software de reclutamiento",
    "plataforma de empleo whatsapp",
    "recolecci\u00f3n de datos candidatos",
    "headhunter whatsapp",
    "automatizaci\u00f3n de reclutamiento",
    "screening de candidatos",
    "selecci\u00f3n de personal con ia",
    "contrataci\u00f3n operativa m\u00e9xico",
    "reclutamiento de cajeros repartidores meseros",
    "alternativa a occ computrabajo indeed",
    "agente de reclutamiento ia",
    "talento m\u00e9xico",
    "panel ejecutivo de candidatos",
  ],
  authors: [{ name: "Jalector", url: "https://jalector.com" }],
  creator: "Jalector",
  publisher: "Jalector",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
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
    siteName: "Jalector",
    title: "Jalector | Captación de candidatos por WhatsApp y panel ejecutivo",
    description:
      "Capta candidatos por WhatsApp con un chatbot conversacional y gestiónalos desde tu panel ejecutivo. Diseñado para retail, restaurantes, logística y back office.",
    images: [
      {
        url: "/logo.png",
        width: 1230,
        height: 1230,
        alt: "Logo de Jalector - Captación de candidatos por WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jalector | Captación de candidatos por WhatsApp y panel ejecutivo",
    description:
      "Chatbot que entrevista a tus candidatos por WhatsApp y los entrega en tu panel ejecutivo listos para contratar.",
    images: ["/logo.png"],
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
      name: "Jalector",
      url: "https://jalector.com",
      logo: {
        "@type": "ImageObject",
        url: "https://jalector.com/logo.png",
      },
      description:
        "Plataforma de captación de candidatos por WhatsApp con panel ejecutivo para gestionar todo el proceso de contratación.",
      sameAs: ["https://jalector.com"],
    },
    {
      "@type": "WebSite",
      "@id": "https://jalector.com/#website",
      url: "https://jalector.com",
      name: "Jalector",
      publisher: { "@id": "https://jalector.com/#organization" },
      inLanguage: "es-MX",
      description:
        "Capta candidatos por WhatsApp con un chatbot conversacional y gestiónalos desde tu panel ejecutivo.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Jalector",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, WhatsApp",
      url: "https://jalector.com",
      description:
        "Chatbot de captación de candidatos por WhatsApp con panel ejecutivo para retail, restaurantes, logística y back office.",
      offers: {
        "@type": "Offer",
        category: "reclutamiento por whatsapp",
      },
    },
    {
      "@type": "Service",
      name: "Captación de candidatos por WhatsApp",
      provider: { "@id": "https://jalector.com/#organization" },
      serviceType: "Reclutamiento por WhatsApp con panel ejecutivo",
      areaServed: {
        "@type": "Country",
        name: "México",
      },
      description:
        "Jalector capta candidatos por WhatsApp con un chatbot que entrevista en 3 minutos y entrega cada perfil estructurado en tu panel ejecutivo.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de reclutamiento por WhatsApp",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Chatbot de captación por WhatsApp",
              description:
                "Entrevista automatizada por WhatsApp que recolecta datos clave del candidato sin formularios.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Panel ejecutivo de candidatos",
              description:
                "Vista única con filtros, prioridades y match contra vacantes activas para todo el equipo de talento.",
            },
          },
          {
            "@type": "Service",
            name: "Integración con WhatsApp Business API",
            description:
              "Conexión con el número oficial de WhatsApp Business para conversaciones a nombre de tu empresa.",
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué es Jalector?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Jalector es una plataforma de captación de candidatos por WhatsApp con un panel ejecutivo donde tu empresa gestiona los perfiles que el chatbot recolecta.",
          },
        },
        {
          "@type": "Question",
          name: "¿Mis candidatos necesitan descargar una app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Usan el WhatsApp que ya tienen instalado. Solo escanean un QR o dan clic en un link y la conversación con el chatbot inicia de inmediato.",
          },
        },
        {
          "@type": "Question",
          name: "¿Para qué empresas funciona Jalector?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Funciona para empresas con contratación operativa de alto volumen como retail, restaurantes y logística, y también para roles corporativos como atención a cliente, ventas y back office.",
          },
        },
      ],
    },
  ],
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("jalector-theme");
    const theme = stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geist.variable} ${interTight.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
