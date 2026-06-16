import type { Metadata } from "next";
import { Geist, Inter_Tight } from "next/font/google";
import "./globals.css";
import { OG_LOCALE, SITE_LOCALE, SITE_NAME, SITE_URL } from "@/lib/seo/config";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Captación de candidatos por WhatsApp y panel ejecutivo`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Jalector capta candidatos por WhatsApp con un chatbot que recolecta sus datos en 3 minutos y los entrega listos para contratar en tu panel ejecutivo. Reclutamiento sin formularios, sin CVs en PDF, sin Excel suelto.",
  keywords: [
    "jalector",
    "captacion de candidatos por whatsapp",
    "chatbot de reclutamiento",
    "chatbot reclutador whatsapp",
    "panel de candidatos",
    "ats whatsapp",
    "reclutamiento por whatsapp",
    "software de reclutamiento",
    "plataforma de empleo whatsapp",
    "recoleccion de datos candidatos",
    "headhunter whatsapp",
    "automatizacion de reclutamiento",
    "screening de candidatos",
    "seleccion de personal con ia",
    "contratacion operativa mexico",
    "reclutamiento de cajeros repartidores meseros",
    "alternativa a occ computrabajo indeed",
    "agente de reclutamiento ia",
    "talento mexico",
    "panel ejecutivo de candidatos",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  generator: "Next.js",
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
    locale: OG_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Captación de candidatos por WhatsApp y panel ejecutivo`,
    description:
      "Capta candidatos por WhatsApp con un chatbot conversacional y gestiónalos desde tu panel ejecutivo. Diseñado para retail, restaurantes, logística y back office.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Jalector - Captación de candidatos por WhatsApp con panel ejecutivo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Captación de candidatos por WhatsApp y panel ejecutivo`,
    description:
      "Chatbot que entrevista a tus candidatos por WhatsApp y los entrega en tu panel ejecutivo listos para contratar.",
    images: [`${SITE_URL}/opengraph-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: { [SITE_LOCALE]: SITE_URL },
  },
  category: "technology",
  classification: "Business",
};

const ORG_ID = `${SITE_URL}#organization`;
const WEBSITE_ID = `${SITE_URL}#website`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
      description:
        "Plataforma de captación de candidatos por WhatsApp con panel ejecutivo para gestionar todo el proceso de contratación.",
      sameAs: [SITE_URL],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": ORG_ID },
      inLanguage: SITE_LOCALE,
      description:
        "Capta candidatos por WhatsApp con un chatbot conversacional y gestiónalos desde tu panel ejecutivo.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      applicationSuite: "Captación de talento",
      operatingSystem: "Web, WhatsApp",
      url: SITE_URL,
      description:
        "Chatbot de captación de candidatos por WhatsApp con panel ejecutivo para retail, restaurantes, logística y back office.",
      publisher: { "@id": ORG_ID },
      offers: {
        "@type": "Offer",
        category: "reclutamiento por whatsapp",
        priceCurrency: "MXN",
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}#service`,
      name: "Captación de candidatos por WhatsApp",
      serviceType: "Reclutamiento por WhatsApp con panel ejecutivo",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "México" },
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
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Integración con WhatsApp Business API",
              description:
                "Conexión con el número oficial de WhatsApp Business para conversaciones a nombre de tu empresa.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}#webpage`,
      url: SITE_URL,
      name: "Jalector - Captación de candidatos por WhatsApp con panel ejecutivo",
      description:
        "Chatbot que entrevista candidatos por WhatsApp y entrega perfiles en tu panel ejecutivo.",
      inLanguage: SITE_LOCALE,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: SITE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}#faq`,
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
          name: "¿Mis candidatos necesitan descargar una aplicación?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Usan el WhatsApp que ya tienen instalado. Solo escanean un código QR o dan clic en un enlace y la conversación con el chatbot inicia de inmediato.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo funciona el panel ejecutivo de candidatos?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El chatbot entrevista a cada candidato y guarda la información en campos estructurados. Tu panel ejecutivo muestra los perfiles con score, prioridad, match con tus vacantes y filtros por puesto, ubicación, turno y disponibilidad.",
          },
        },
        {
          "@type": "Question",
          name: "¿Para qué tipo de empresas funciona Jalector?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Funciona para empresas con contratación operativa de alto volumen como retail, restaurantes, logística y manufactura, y también para roles corporativos como atención a cliente, ventas y back office.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cumple Jalector con la LFPDPPP?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Jalector aplica cifrado en tránsito y en reposo, entornos aislados por cliente y prácticas de manejo de datos personales conformes a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México.",
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
