"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  ChevronRight,
  ClipboardX,
  Clock,
  FileText,
  Filter,
  Gauge,
  Headphones,
  Hourglass,
  IdCard,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Moon,
  PhoneOff,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { animate, createTimeline, stagger } from "animejs";

const WHATSAPP_URL = "https://wa.me/5215564329548";
const EMAIL_URL = "mailto:monserrat.pineda@clarios.com.mx";

const metrics = [
  { value: "8×", label: "candidatos calificados por vacante publicada" },
  { value: "92%", label: "perfiles con información completa al cierre del día" },
  { value: "24/7", label: "captación continua sin operadores humanos" },
  { value: "3 min", label: "duración promedio del perfil conversacional" },
];

const painPoints = [
  {
    icon: ClipboardX,
    title: "Aplicaciones sin filtrar saturan al equipo",
    text: "Las bolsas tradicionales entregan volumen sin contexto. Tu coordinador invierte horas descartando CVs cuando debería estar avanzando entrevistas.",
  },
  {
    icon: PhoneOff,
    title: "Los canales que el candidato ignora",
    text: "El aspirante operativo responde WhatsApp en minutos, pero deja sin abrir el correo durante días. Pierdes a quien sí está disponible para contratar.",
  },
  {
    icon: FileText,
    title: "Formularios extensos que nadie completa",
    text: "Menos del veinte por ciento de los aspirantes termina un formulario con más de tres pantallas. El talento abandona el proceso antes de que sepas que existió.",
  },
  {
    icon: Hourglass,
    title: "Procesos fragmentados sin trazabilidad",
    text: "Sin una vista única, cada gerente trabaja con su propio Excel. La información se dispersa y la decisión de contratación se retrasa días enteros.",
  },
];

const candidateSteps = [
  {
    icon: QrCode,
    title: "El candidato inicia la conversación",
    text: "Publica un enlace o código QR de Jalector en vacantes, redes y puntos físicos. El aspirante hace clic y la conversación comienza sin descargar nada.",
  },
  {
    icon: MessageCircle,
    title: "El chatbot conduce la entrevista",
    text: "Jalector pregunta nombre, edad, ubicación, experiencia, turno y expectativa salarial en lenguaje natural. Valida en tiempo real y construye el perfil completo en menos de tres minutos.",
  },
  {
    icon: LayoutDashboard,
    title: "Tu equipo decide desde el panel",
    text: "Cada perfil aparece en el panel ejecutivo con score, prioridad y match contra tus vacantes activas. Filtras, asignas y avanzas a entrevista en un solo clic.",
  },
];

const collectedFields = [
  { label: "Nombre completo", icon: IdCard },
  { label: "Edad y ubicación", icon: MapPin },
  { label: "Último empleo", icon: Building2 },
  { label: "Puesto buscado", icon: Filter },
  { label: "Años de experiencia", icon: TrendingUp },
  { label: "Disponibilidad", icon: Clock },
  { label: "Turno preferido", icon: Sun },
  { label: "Expectativa salarial", icon: Gauge },
  { label: "Documentación", icon: FileText },
  { label: "CURP", icon: ShieldCheck },
  { label: "Origen y campaña", icon: QrCode },
  { label: "Historial conversacional", icon: MessageCircle },
];

const dashboardFeatures = [
  "Vista única por candidato con historial conversacional completo",
  "Filtros por puesto, ubicación, turno, disponibilidad y prioridad",
  "Score y prioridad asignados automáticamente al perfil",
  "Match instantáneo contra tus vacantes activas",
  "Métricas operativas: conversión, tiempo de respuesta y volumen",
  "Exportable a tu ATS, Excel, BI o API",
];

const pipeline = [
  { name: "María L.", role: "Cajera · Iztapalapa", match: 96, status: "Lista" },
  { name: "Carlos R.", role: "Repartidor · GAM", match: 91, status: "Validar" },
  { name: "Ana P.", role: "Almacén · Cuauhtémoc", match: 88, status: "Agenda" },
];

const comparison = [
  {
    feature: "Canal del candidato",
    legacy: "Portal con usuario y contraseña",
    jalector: "WhatsApp sin instalación",
  },
  {
    feature: "Llenado del perfil",
    legacy: "Formularios de veinte o más campos",
    jalector: "Conversación guiada de tres minutos",
  },
  {
    feature: "Calidad de la información",
    legacy: "CVs en PDF con formatos heterogéneos",
    jalector: "Campos estructurados y validados",
  },
  {
    feature: "Tasa de respuesta",
    legacy: "Correo y llamada con baja apertura",
    jalector: "WhatsApp con 98 % de apertura",
  },
  {
    feature: "Modelo de cobro",
    legacy: "Pago por publicación, clic o CV recibido",
    jalector: "Suscripción con captación ilimitada",
  },
  {
    feature: "Tiempo a primera entrevista",
    legacy: "Cinco a diez días en promedio",
    jalector: "Menos de cuarenta y ocho horas",
  },
  {
    feature: "Gestión interna",
    legacy: "Hojas de cálculo y correos compartidos",
    jalector: "Panel ejecutivo con prioridad y trazabilidad",
  },
  {
    feature: "Integraciones",
    legacy: "Exportes manuales y descargas individuales",
    jalector: "API, exportes automáticos y conexión con ATS",
  },
];

const useCases = [
  {
    icon: Building2,
    industry: "Retail y autoservicio",
    role: "Cajeros, piso de venta y almacén",
    challenge:
      "Rotación mensual cercana al treinta y cinco por ciento y vacantes urgentes distribuidas en decenas de sucursales.",
    outcome:
      "Cada tienda capta candidatos con un QR propio y el panel centraliza todos los perfiles para el equipo corporativo de reclutamiento.",
    metric: "+120 perfiles capturados por tienda al mes",
  },
  {
    icon: UtensilsCrossed,
    industry: "Restaurantes y quick service",
    role: "Meseros, baristas, cocina y delivery",
    challenge:
      "Necesidad de validar edad, turno y zona antes de citar al aspirante a una entrevista presencial.",
    outcome:
      "El chatbot filtra disponibilidad y documentación antes de pasar el perfil al gerente de unidad.",
    metric: "48 horas en promedio para cubrir una vacante",
  },
  {
    icon: Headphones,
    industry: "Corporativo y back office",
    role: "Atención a cliente, ventas y mandos medios",
    challenge:
      "Procesar cientos de aplicaciones con CVs heterogéneos y sin contexto comparable entre candidatos.",
    outcome:
      "Recursos humanos recibe fichas estructuradas con score, resumen ejecutivo y siguiente acción sugerida por candidato.",
    metric: "8× más candidatos calificados por vacante",
  },
];

const faqs = [
  {
    question: "¿Es necesario que mis candidatos descarguen una aplicación?",
    answer:
      "No. La conversación ocurre dentro del WhatsApp que ya tienen instalado. El aspirante hace clic en un enlace o escanea un código QR y la interacción comienza de inmediato.",
  },
  {
    question: "¿Funciona con mi número actual de WhatsApp Business?",
    answer:
      "Sí. Conectamos Jalector al número oficial de WhatsApp Business API para que toda la comunicación salga a nombre de tu empresa, con tu marca y tus términos.",
  },
  {
    question: "¿Qué sucede cuando un candidato no termina su perfil?",
    answer:
      "Jalector reactiva la conversación de forma automática y la reanuda exactamente donde se interrumpió. El panel muestra el progreso de cada candidato en tiempo real.",
  },
  {
    question: "¿La información permanece dentro de mi organización?",
    answer:
      "Sí. Cada cliente cuenta con un entorno aislado y puede exportar los datos en cualquier momento. Cumplimos con la LFPDPPP y aplicamos cifrado en tránsito y en reposo.",
  },
  {
    question: "¿Reemplaza a mi bolsa de empleo actual?",
    answer:
      "Funciona como reemplazo o como capa de captación frente a tu bolsa. La mayoría de los clientes conserva una bolsa para difusión y deja a Jalector como filtro principal antes de la entrevista.",
  },
  {
    question: "¿Cubre roles operativos y corporativos?",
    answer:
      "Sí. Se utiliza con éxito para perfiles operativos como cajeros, repartidores y meseros, y también para roles administrativos, ventas y atención a cliente.",
  },
];

const footerColumns = [
  {
    title: "Producto",
    links: [
      { label: "Proceso", href: "#proceso" },
      { label: "Panel ejecutivo", href: "#producto" },
      { label: "Casos reales", href: "#casos" },
      { label: "Comparativa", href: "#comparativa" },
      { label: "Solicitar demo", href: EMAIL_URL, external: true },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", href: "/soporte" },
      { label: "Contacto comercial", href: EMAIL_URL, external: true },
      { label: "Soporte por email", href: EMAIL_URL },
      { label: "Estado del servicio", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso de privacidad", href: "/aviso-de-privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Política de cookies", href: "/cookies" },
      { label: "Seguridad", href: "/seguridad" },
    ],
  },
];

export default function JalectorLanding() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      return;
    }

    const intro = createTimeline({
      defaults: { ease: "outExpo", duration: 900 },
    });

    intro
      .add(".hero-kicker", { opacity: [0, 1], y: [12, 0], duration: 650 })
      .add(".hero-word", { opacity: [0, 1], y: [24, 0], delay: stagger(55) }, "-=420")
      .add(".hero-copy", { opacity: [0, 1], y: [20, 0] }, "-=520")
      .add(".hero-action", { opacity: [0, 1], y: [16, 0], delay: stagger(70) }, "-=520")
      .add(".hero-panel", { opacity: [0, 1], y: [28, 0], scale: [0.97, 1] }, "-=620");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          animate(entry.target, {
            opacity: [0, 1],
            y: [22, 0],
            duration: 750,
            ease: "outExpo",
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 },
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    animate(".signal-line", {
      strokeDashoffset: [1200, 0],
      opacity: [0.08, 0.42, 0.08],
      duration: stagger([4800, 7000]),
      delay: stagger(220),
      loop: true,
      ease: "inOutSine",
    });

    animate(".signal-chip", {
      x: stagger([-12, 12]),
      y: stagger([8, -10]),
      opacity: [0.35, 0.9, 0.35],
      duration: stagger([2600, 4200]),
      delay: stagger(140),
      alternate: true,
      loop: true,
      ease: "inOutSine",
    });

    animate(".candidate-row", {
      x: [16, 0],
      opacity: [0, 1],
      delay: stagger(160, { start: 900 }),
      duration: 800,
      ease: "outExpo",
    });

    animate(".scan-bar", {
      translateX: ["-110%", "110%"],
      duration: 2600,
      loop: true,
      ease: "inOutSine",
    });

    animate(".typing-dot", {
      opacity: [0.25, 1, 0.25],
      y: [0, -3, 0],
      delay: stagger(140),
      duration: 900,
      loop: true,
      ease: "inOutSine",
    });

    return () => observer.disconnect();
  }, []);

  const headline = useMemo(
    () => ["Capta", "candidatos", "por", "WhatsApp.", "Decide", "desde", "tu", "panel."],
    [],
  );

  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("jalector-theme", nextTheme);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <AnimatedBackground />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Jalector">
            <BrandLogo size={42} priority />
            <span className="font-display text-xl font-500 tracking-tight text-[var(--brand-navy)]">
              Jalector
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-[var(--muted)] md:flex">
            <a href="#proceso" className="nav-link">
              Proceso
            </a>
            <a href="#producto" className="nav-link">
              Panel
            </a>
            <a href="#comparativa" className="nav-link">
              Comparativa
            </a>
            <a href="#casos" className="nav-link">
              Casos
            </a>
            <a href="#faq" className="nav-link">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Cambiar tema"
              onClick={toggleTheme}
              className="theme-toggle"
            >
              <Sun size={17} className="theme-icon theme-icon-sun" />
              <Moon size={17} className="theme-icon theme-icon-moon" />
            </button>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="primary-button hidden sm:inline-flex">
              Contactar
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </nav>

      <section id="top" className="relative min-h-screen px-5 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 pb-16 pt-10 lg:grid-cols-[1.03fr_0.97fr] lg:pb-20 lg:pt-20">
          <div className="relative z-10 max-w-3xl">
            

            <h1 className="font-display text-5xl font-500 leading-[1.04] tracking-tight text-[var(--foreground)] md:text-7xl lg:text-[5.6rem]">
              {headline.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={`hero-word mr-3 inline-block ${
                    word === "WhatsApp." || word === "panel." ? "text-gradient" : ""
                  }`}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p className="hero-copy mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl md:leading-9">
              Jalector entrevista a tus aspirantes en una conversación de tres
              minutos por WhatsApp, valida la información que tu operación necesita
              y entrega cada perfil estructurado en un panel ejecutivo construido
              para tu equipo de talento.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hero-action primary-button">
                Probar el chatbot
                <ArrowRight size={17} />
              </a>
              <a href={EMAIL_URL} className="hero-action secondary-button">
                Agendar demostración
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="hero-action mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-500 text-[var(--muted)]">
              <span className="inline-flex items-center gap-2">
                <Check size={14} className="text-[var(--brand-green)]" />
                Sin instalación para el candidato
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={14} className="text-[var(--brand-green)]" />
                Compatible con WhatsApp Business API
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={14} className="text-[var(--brand-green)]" />
                Cumple con la LFPDPPP
              </span>
            </div>
          </div>

          <HeroConsole />
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] px-5 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="reveal stat-tile">
              <p className="font-display text-4xl font-500 md:text-5xl">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)] font-400">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="problema" className="section-shell">
        <SectionHeader
          eyebrow="El estado actual"
          title="El reclutamiento convencional no fue diseñado para tu velocidad"
          text="Estos son los costos ocultos que detectamos en operaciones de talento de alto volumen en México."
        />

        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <article key={point.title} className="reveal pain-card">
                <div className="pain-icon">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 font-display text-lg font-500 tracking-tight">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{point.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="proceso" className="section-shell border-y border-[var(--line)] bg-[var(--surface)]">
        <SectionHeader
          eyebrow="Cómo opera"
          title="Una conversación, una ficha, una decisión"
          text="Diseñado para que el candidato avance por sí mismo y tu equipo intervenga solo cuando agrega valor."
        />

        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {candidateSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="reveal process-card">
                <span className="process-index">0{index + 1}</span>
                <div className="icon-box">
                  <Icon size={24} />
                </div>
                <h3 className="mt-8 font-display text-xl font-500 tracking-tight">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="datos-capturados" className="section-shell">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="reveal">
            <p className="eyebrow">Información estructurada</p>
            <h2 className="section-title mt-5">
              Cada conversación se vuelve una ficha lista para decidir
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              Olvídate de leer CVs en formatos distintos. Jalector pregunta
              exactamente lo que tu operación necesita y almacena la respuesta
              en campos comparables, exportables y auditables.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-500 text-[var(--muted)]">
              <span className="data-meta-pill">
                <Clock size={13} className="text-[var(--brand-green)]" />
                Captura en 3 minutos en promedio
              </span>
              <span className="data-meta-pill">
                <ShieldCheck size={13} className="text-[var(--brand-green)]" />
                Validación contextual en tiempo real
              </span>
              <span className="data-meta-pill">
                <FileText size={13} className="text-[var(--brand-green)]" />
                Exportable a CSV, ATS o API
              </span>
            </div>
          </div>

          <div className="reveal data-chip-grid">
            {collectedFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="data-chip">
                  <span className="data-chip-icon">
                    <Icon size={15} />
                  </span>
                  <span>{field.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="producto" className="section-shell border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="reveal">
            <p className="eyebrow">Panel ejecutivo</p>
            <h2 className="section-title mt-5">Una sola vista para toda tu operación de talento</h2>
            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              Visibilidad ejecutiva, control operativo y trazabilidad por
              candidato. Sin sumarle otra pestaña al día de tu equipo y sin
              depender de hojas de cálculo compartidas.
            </p>

            <div className="mt-10 grid gap-3">
              {dashboardFeatures.map((feature) => (
                <div key={feature} className="feature-row">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--green-soft)] text-[var(--brand-green)]">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <ProductBoard />
        </div>
      </section>

      <section id="comparativa" className="section-shell">
        <SectionHeader
          eyebrow="Comparativa"
          title="Jalector frente al reclutamiento convencional"
          text="Diferencias estructurales entre captar por WhatsApp con un panel propio y depender de un portal de empleo o un proceso manual en hojas de cálculo."
        />

        <div className="reveal mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <div className="comparison-table">
            <div className="comparison-head">
              <span>Característica</span>
              <span className="comparison-legacy-head">Bolsa de empleo</span>
              <span className="comparison-jalector-head">
                <Sparkles size={13} />
                Jalector
              </span>
            </div>
            {comparison.map((row) => (
              <div key={row.feature} className="comparison-row">
                <span className="comparison-feature">{row.feature}</span>
                <span className="comparison-legacy">
                  <X size={14} className="text-[#ef4444]" />
                  {row.legacy}
                </span>
                <span className="comparison-jalector">
                  <Check size={14} strokeWidth={2.5} className="text-[var(--brand-green)]" />
                  {row.jalector}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="casos" className="section-shell border-y border-[var(--line)] bg-[var(--surface)]">
        <SectionHeader
          eyebrow="Casos de uso"
          title="Operaciones que ya cambiaron su forma de reclutar"
          text="Tres verticales, un mismo flujo: captar por WhatsApp y operar desde un panel ejecutivo."
        />

        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <article key={useCase.industry} className="reveal use-case-card">
                <div className="use-case-header">
                  <div className="use-case-icon">
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-500 uppercase tracking-[0.18em] text-[var(--brand-green)]">
                      {useCase.industry}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-500 tracking-tight">
                      {useCase.role}
                    </h3>
                  </div>
                </div>

                <div className="use-case-block">
                  <p className="use-case-label">Reto operativo</p>
                  <p className="use-case-text">{useCase.challenge}</p>
                </div>

                <div className="use-case-block">
                  <p className="use-case-label">Cómo lo resuelven con Jalector</p>
                  <p className="use-case-text">{useCase.outcome}</p>
                </div>

                <div className="use-case-metric">
                  <TrendingUp size={16} className="text-[var(--brand-green)]" />
                  <span>{useCase.metric}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="faq" className="section-shell">
        <SectionHeader
          eyebrow="Preguntas frecuentes"
          title="Lo que suelen preguntar antes de la primera demostración"
          text="Si tu duda no aparece aquí, escríbenos por WhatsApp o por correo y te respondemos el mismo día hábil."
        />

        <div className="reveal mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>
                <span>{faq.question}</span>
                <Plus size={18} className="faq-toggle" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section-shell border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <div className="reveal cta-panel cta-panel-wide">
            <BrandLogo size={64} />
            <h2 className="mt-8 font-display text-3xl font-500 leading-[1.05] tracking-tight text-white md:text-5xl">
              El bot ya está en marcha. Solicita acceso y empieza hoy.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
              Jalector opera desde nuestro número de WhatsApp Business preconfigurado.
              Aprobamos tu cuenta y el chatbot empieza a entrevistar candidatos por ti
              desde el primer día. Sin instalaciones, sin setup técnico, sin
              compromiso anual.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="/registro"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-500 text-[#0f172a] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Solicitar acceso
                <ArrowRight size={16} />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-500 text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Probar por WhatsApp
                <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="flex items-center gap-3">
                <BrandLogo size={44} />
                <div>
                  <p className="font-display text-xl font-500 tracking-tight">
                    Jalector
                  </p>
                  <p className="text-[0.68rem] font-500 uppercase tracking-[0.18em] text-[var(--brand-green)]">
                    Eligiendo jale con claridad
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[var(--muted)]">
                Jalector capta candidatos por WhatsApp con un chatbot que
                entrevista, valida y entrega cada perfil en el panel ejecutivo
                de tu equipo de talento.
              </p>
              <a
                href={EMAIL_URL}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-500 text-[var(--background)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Contactar al equipo comercial
                <ArrowRight size={15} />
              </a>
            </div>

            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="footer-title">{column.title}</h3>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer" : undefined}
                        className="footer-link"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="footer-bottom">
            <p>© 2026 Jalector. Todos los derechos reservados.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="/aviso-de-privacidad" className="footer-link">
                Privacidad
              </a>
              <a href="/terminos" className="footer-link">
                Términos
              </a>
              <a href={EMAIL_URL} className="footer-link">
                monserrat.pineda@clarios.com.mx
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="animated-grid absolute inset-0" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true" viewBox="0 0 1440 920" preserveAspectRatio="none">
        <path className="signal-line" d="M-80 210 C 260 90, 410 320, 700 230 S 1130 60, 1520 190" />
        <path className="signal-line" d="M-120 520 C 220 420, 450 640, 735 520 S 1100 360, 1510 510" />
        <path className="signal-line" d="M-90 780 C 300 710, 470 840, 760 750 S 1090 650, 1510 720" />
        <rect className="signal-chip" x="190" y="168" width="54" height="10" rx="5" />
        <rect className="signal-chip" x="724" y="501" width="78" height="10" rx="5" />
        <rect className="signal-chip" x="1050" y="706" width="62" height="10" rx="5" />
      </svg>
    </div>
  );
}

function HeroConsole() {
  return (
    <div className="hero-panel relative z-10">
      <div className="phone-shell">
        <div className="scan-bar" />
        <div className="phone-status">
          <span>9:41</span>
          <span className="phone-notch" />
          <span>5G</span>
        </div>

        <div className="whatsapp-header">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-[#06204a]">
              <Bot size={19} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#075e54] bg-[#25d366]" />
            </div>
            <div>
              <p className="text-sm font-600 text-white">Jalector</p>
              <p className="text-xs text-white/62">en línea · asistente de contratación</p>
            </div>
          </div>
          <span className="text-lg leading-none text-white/70">⋮</span>
        </div>

        <div className="whatsapp-chat">
          <div className="wa-bubble wa-bubble-bot">
            <p>¡Hola! Soy Jalector. ¿Cómo te llamas y cuántos años tienes?</p>
            <span>9:41</span>
          </div>
          <div className="wa-bubble wa-bubble-user">
            <p>María López, 24 años. Vivo en Iztapalapa.</p>
            <span>9:42 ✓✓</span>
          </div>
          <div className="wa-bubble wa-bubble-bot">
            <p>Gracias, María. ¿Qué turno te acomoda y tienes experiencia previa?</p>
            <span>9:42</span>
          </div>
          <div className="wa-bubble wa-bubble-user">
            <p>Matutino o vespertino. Dos años como cajera en OXXO.</p>
            <span>9:43 ✓✓</span>
          </div>

          <div className="wa-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#25d366]" />
                <p className="text-xs font-600 text-[#10251d]">Perfil completado</p>
              </div>
              <span className="rounded-full bg-[#d9fdd3] px-2 py-1 text-[10px] font-600 text-[#17764a]">
                3 vacantes match
              </span>
            </div>
            {pipeline.map((candidate) => (
              <div key={candidate.name} className="candidate-row wa-candidate">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#0b2d61] text-xs font-600 text-white">
                  {candidate.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-600 text-[#111b21]">{candidate.name}</p>
                  <p className="truncate text-[11px] text-[#667781]">{candidate.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-600 text-[#00a884]">{candidate.match}%</p>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#667781]">{candidate.status}</p>
                </div>
              </div>
            ))}
            <p className="mt-3 text-[11px] font-500 text-[#008069]">
              Enviado al panel ejecutivo →
            </p>
            <span className="block text-right text-[10px] text-[#667781]">9:43</span>
          </div>

          <div className="typing-pill">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>

        <div className="whatsapp-input">
          <span>Escribe un mensaje</span>
          <MessageCircle size={18} />
        </div>
      </div>
    </div>
  );
}

function BrandLogo({ size, priority = false }: { size: number; priority?: boolean }) {
  const style = { "--logo-size": `${size}px` } as CSSProperties;

  return (
    <span className="brand-logo-shell" style={style} aria-hidden="true">
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="brand-logo-image"
      />
    </span>
  );
}

function ProductBoard() {
  return (
    <div className="reveal product-board">
      <div className="board-header">
        <div>
          <p className="text-[0.68rem] font-500 uppercase tracking-[0.18em] text-[var(--muted)]">
            Panel ejecutivo
          </p>
          <h3 className="mt-2 font-display text-2xl font-500 tracking-tight">
            Operación CDMX · Sucursales
          </h3>
        </div>
        <span className="rounded-full bg-[var(--green-soft)] px-4 py-2 text-xs font-500 text-[var(--brand-green)]">
          47 nuevos en 24 h
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.84fr_1.16fr]">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-5">
          <p className="mb-5 text-[0.68rem] font-500 uppercase tracking-[0.18em] text-[var(--muted)]">
            Salud de la operación
          </p>
          {[
            ["Perfiles completos", 92],
            ["Disponibilidad inmediata", 78],
            ["Documentación lista", 64],
            ["Match con vacantes", 88],
          ].map(([label, value]) => (
            <div key={label} className="mb-5 last:mb-0">
              <div className="mb-2 flex justify-between text-xs font-500">
                <span>{label}</span>
                <span className="text-[var(--muted)]">{value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--track)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-green),var(--brand-teal))]"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={18} className="text-[var(--brand-green)]" />
              <p className="text-sm font-500">Cola de candidatos</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-[10px] font-500 uppercase tracking-[0.14em] text-[var(--muted)]">
              Hoy
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: "María L.", role: "Cajera matutino", zone: "Iztapalapa", priority: "Alta", match: 96 },
              { name: "Carlos R.", role: "Repartidor turno noche", zone: "GAM", priority: "Alta", match: 91 },
              { name: "Ana P.", role: "Almacén tiempo completo", zone: "Cuauhtémoc", priority: "Media", match: 88 },
              { name: "Luis V.", role: "Atención a cliente", zone: "Coyoacán", priority: "Media", match: 84 },
            ].map((candidate) => (
              <div key={candidate.name} className="board-row">
                <div className="board-row-avatar">{candidate.name.slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-500">{candidate.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {candidate.role} · {candidate.zone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`priority-pill priority-${candidate.priority === "Alta" ? "high" : "medium"}`}
                  >
                    {candidate.priority}
                  </span>
                  <span className="text-sm font-600 text-[var(--brand-green)]">
                    {candidate.match}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="reveal mx-auto max-w-3xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-4">{title}</h2>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">{text}</p>
    </div>
  );
}
