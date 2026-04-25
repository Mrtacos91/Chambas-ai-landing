import {
  MessageSquare,
  Bot,
  Target,
  Brain,
  Zap,
  ShieldCheck,
  BarChart3,
  Link2,
  Globe,
  Check,
  Search,
  CheckCircle2,
  Hand,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const WhatsAppIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.114 1.524 5.84L0 24l6.336-1.491A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.37l-.36-.213-3.722.976.994-3.64-.234-.373A9.818 9.818 0 1112 21.818z" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111110] overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-14 border-b border-neutral-200/80 backdrop-blur-xl bg-[#f8f8f6]/90">
        <img src="/jalector.svg" alt="Jalector" className="h-7 w-auto" />

        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-500">
          <a
            href="#como-funciona"
            className="hover:text-[#111110] transition-colors"
          >
            Cómo funciona
          </a>
          <a
            href="#funciones"
            className="hover:text-[#111110] transition-colors"
          >
            Funciones
          </a>
          <a
            href="#clientes"
            className="hover:text-[#111110] transition-colors"
          >
            Clientes
          </a>
          <a href="#clarios" className="hover:text-[#111110] transition-colors">
            Clarios
          </a>
        </div>

        <a
          href="https://wa.me/5215564329548?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Clarios%20by%20Jalector"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#111110] text-white text-sm font-medium hover:bg-neutral-800 transition-all"
        >
          <WhatsAppIcon size={14} />
          Contactar
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-225 h-125 bg-[#25D366]/6 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-100 h-100 bg-[#25D366]/4 rounded-full blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.028]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #111110 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-28">
          {/* Left */}
          <div className="space-y-8">
            <div className="animate-fade-in-up inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-neutral-300 bg-neutral-100 text-neutral-500 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              Próximamente · Chatbot de reclutamiento por WhatsApp
            </div>

            <h1 className="animate-fade-in-up delay-100 font-display text-5xl md:text-6xl lg:text-[4.5rem] font-800 leading-[1.04] tracking-[-0.02em] text-[#111110]">
              Contrata el mejor talento a través de{" "}
              <span className="text-[#25D366]">WhatsApp</span>
            </h1>

            <p className="animate-fade-in-up delay-200 text-lg text-neutral-500 leading-relaxed max-w-105">
              Un agente conversacional que entiende lo que buscas, filtra miles
              de candidatos y te presenta únicamente los perfiles que encajan —
              directamente en tu chat.
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3.5">
              <span className="px-8 py-4 rounded-full bg-neutral-200 text-neutral-400 font-bold text-[15px] text-center tracking-tight cursor-not-allowed select-none">
                Disponible pronto
              </span>
              <a
                href="#clarios"
                className="px-8 py-4 rounded-full border border-neutral-300 text-neutral-600 font-medium text-[15px] hover:border-neutral-400 hover:text-[#111110] transition-all text-center"
              >
                Ver Clarios →
              </a>
            </div>

            <div className="animate-fade-in-up delay-400 pt-2">
              <a
                href="#clarios"
                className="inline-flex items-center gap-2.5 text-sm text-neutral-500 hover:text-[#111110] transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full bg-[#4CAF7D]"
                  style={{ boxShadow: "0 0 0 3px rgba(76,175,125,0.2)" }}
                />
                Clarios ya está disponible — conoce la plataforma
              </a>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="animate-scale-in delay-200 animate-float relative">
              <div className="absolute -inset-4 bg-[#25D366]/8 rounded-[60px] blur-3xl" />
              <div
                className="relative w-75 sm:w-80 rounded-[40px] bg-[#111] border border-neutral-200 overflow-hidden"
                style={{
                  boxShadow:
                    "0 40px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                {/* Status bar */}
                <div className="bg-[#075E54] flex items-center justify-between px-5 pt-9 pb-3">
                  <div className="text-white/70 text-[10px] font-medium">
                    9:41
                  </div>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#080808] rounded-full" />
                  <div className="flex gap-1 text-white/70">
                    <div className="w-3 h-3 flex items-end gap-px">
                      <div className="w-0.5 h-1 bg-white/70 rounded-sm" />
                      <div className="w-0.5 h-2 bg-white/70 rounded-sm" />
                      <div className="w-0.5 h-3 bg-white/70 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp header */}
                <div className="bg-[#075E54] px-4 pb-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    JA
                  </div>
                  <div>
                    <p className="text-white text-[13px] font-semibold leading-tight">
                      Jalector AI
                    </p>
                    <p className="text-white/60 text-[10px]">● En línea</p>
                  </div>
                </div>

                {/* Chat area */}
                <div
                  className="p-3 space-y-2 pb-4"
                  style={{
                    background:
                      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\"), #ECE5DD",
                  }}
                >
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-[#111] text-[11px] leading-relaxed flex items-center gap-1 flex-wrap">
                        <Hand
                          size={11}
                          className="inline text-[#075E54] shrink-0"
                        />
                        ¡Hola! Soy Jalector AI. ¿Qué perfil necesitas hoy?
                      </p>
                      <p className="text-[#aaa] text-[9px] text-right mt-0.5">
                        9:41
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-none px-3 py-2 max-w-[82%] shadow-sm">
                      <p className="text-[#111] text-[11px] leading-relaxed">
                        Desarrollador Full Stack, React + Node.js, senior
                      </p>
                      <p className="text-[#aaa] text-[9px] text-right mt-0.5">
                        9:42 ✓✓
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-[#111] text-[11px] leading-relaxed flex items-center gap-1">
                        <Search
                          size={10}
                          className="inline text-[#075E54] shrink-0"
                        />
                        Analizando 2,847 perfiles...
                      </p>
                      <p className="text-[#aaa] text-[9px] text-right mt-0.5">
                        9:42
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[90%] shadow-sm">
                      <p className="text-[#111] text-[11px] font-semibold mb-2 flex items-center gap-1">
                        <CheckCircle2
                          size={11}
                          className="text-[#25D366] shrink-0"
                        />
                        8 candidatos ideales encontrados:
                      </p>
                      <div className="bg-[#f5f5f5] rounded-xl p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#45B7D1] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            CM
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#111] text-[11px] font-semibold">
                              Carlos M.
                            </p>
                            <p className="text-[#777] text-[9px]">
                              Full Stack Dev · 5 años exp.
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-[#25D366]">
                            98%
                          </span>
                        </div>
                      </div>
                      <p className="text-[#075E54] text-[10px] mt-2 font-medium cursor-pointer hover:underline">
                        Ver CV completo · Contactar →
                      </p>
                      <p className="text-[#aaa] text-[9px] text-right mt-0.5">
                        9:43
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "14M+", label: "Registros de empleo analizados" },
            { value: "380+", label: "Perfiles de puesto cubiertos" },
            { value: "3 ciudades", label: "CDMX · MTY · GDL" },
            { value: "Tiempo real", label: "Actualización de datos" },
          ].map((s) => (
            <div key={s.label} className="scroll-reveal">
              <p className="font-display text-4xl font-800 text-[#111110] tabular-nums tracking-tight">
                {s.value}
              </p>
              <p className="text-xs text-neutral-400 mt-2 leading-snug">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="como-funciona" className="py-32 px-6 md:px-14 bg-[#f8f8f6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              El proceso
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-800 tracking-[-0.02em] text-[#111110]">
              Tan simple como enviar un mensaje
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                icon: <MessageSquare size={22} className="text-[#25D366]" />,
                title: "Describe lo que buscas",
                desc: "Escríbele al bot en lenguaje natural. El puesto, las habilidades, el nivel de experiencia y el tipo de contrato. Sin formularios ni filtros complejos.",
              },
              {
                step: "02",
                icon: <Bot size={22} className="text-[#25D366]" />,
                title: "La IA evalúa y filtra",
                desc: "Nuestro motor analiza miles de perfiles en segundos, evalúa hard skills, experiencia, zona horaria y compatibilidad cultural.",
              },
              {
                step: "03",
                icon: <Target size={22} className="text-[#25D366]" />,
                title: "Recibe candidatos listos",
                desc: "El bot te presenta los mejores perfiles con un resumen ejecutivo. Tú decides a quién contactar — todo desde WhatsApp.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="scroll-reveal relative p-8 rounded-2xl border border-neutral-200 bg-white hover:border-[#25D366]/40 hover:shadow-sm transition-all duration-300 group"
              >
                <span className="absolute top-5 right-6 font-display text-8xl font-800 text-neutral-100 group-hover:text-[#25D366]/12 transition-colors select-none leading-none">
                  {item.step}
                </span>
                <div className="mb-5 w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-display text-base font-700 mb-2.5 tracking-tight text-[#111110]">
                  {item.title}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conversation flow showcase ── */}
      <section className="py-32 px-6 md:px-14 bg-white border-y border-neutral-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left copy */}
          <div className="space-y-7">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              Flujo de conversación
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-800 leading-tight tracking-[-0.02em] text-[#111110]">
              Recluta como si chateases con un headhunter experto
            </h2>
            <p className="text-neutral-500 leading-relaxed">
              Jalector entiende el contexto, hace las preguntas correctas y
              refina la búsqueda con cada mensaje tuyo. No necesitas configurar
              nada.
            </p>
            <ul className="space-y-3.5">
              {[
                "Búsqueda por lenguaje natural",
                "Preguntas de calificación automáticas",
                "Score de compatibilidad por perfil",
                "Agendamiento de entrevistas integrado",
                "Exportación a tu ATS favorito",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-neutral-600"
                >
                  <span className="w-5 h-5 rounded-full bg-[#25D366]/12 text-[#25D366] flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Extended chat (WhatsApp themed) */}
          <div
            className="rounded-2xl border border-neutral-200 overflow-hidden"
            style={{
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold">
                JA
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Jalector AI</p>
                <p className="text-white/55 text-xs">Reclutador IA · 24/7</p>
              </div>
              <div className="ml-auto flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="p-5 space-y-3 bg-[#f0f2f5]">
              {[
                {
                  from: "bot",
                  msg: "¿Cuántos años de experiencia mínima necesitas?",
                },
                {
                  from: "user",
                  msg: "Al menos 3 años, preferiblemente en startups de tecnología",
                },
                {
                  from: "bot",
                  msg: "¿Trabajo remoto, híbrido o presencial en CDMX?",
                },
                {
                  from: "user",
                  msg: "100% remoto, pero con disponibilidad en horario CST",
                },
                {
                  from: "bot",
                  msg: (
                    <span className="flex items-start gap-1.5">
                      <Target
                        size={12}
                        className="text-[#25D366] mt-0.5 shrink-0"
                      />
                      Perfecto. He encontrado 12 candidatos con 90%+ de
                      compatibilidad. ¿Ves el top 3?
                    </span>
                  ),
                },
                { from: "user", msg: "Sí, muéstramelos" },
                {
                  from: "bot",
                  msg: (
                    <span className="flex items-start gap-1.5">
                      <ClipboardList
                        size={12}
                        className="text-[#25D366] mt-0.5 shrink-0"
                      />
                      #1 — Ana R. · 4 años · React/Node/AWS · Remota México ·
                      Match: 97% · ¿Deseas su CV o agendamos una intro call?
                    </span>
                  ),
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm ${
                      m.from === "user"
                        ? "bg-[#DCF8C6] text-[#111] rounded-tr-none"
                        : "bg-white text-[#111] rounded-tl-none"
                    }`}
                  >
                    {m.msg}
                  </div>
                </div>
              ))}
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="funciones" className="py-32 px-6 md:px-14 bg-[#f8f8f6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              Funcionalidades
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-800 tracking-[-0.02em] text-[#111110]">
              Todo lo que necesitas para contratar mejor
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Brain size={20} className="text-[#25D366]" />,
                title: "IA conversacional avanzada",
                desc: "Comprende matices, sinónimos y contexto. No es un bot rígido — entiende como un reclutador experto.",
              },
              {
                icon: <Zap size={20} className="text-[#25D366]" />,
                title: "Respuesta en segundos",
                desc: "Analiza y filtra miles de candidatos en tiempo real. Olvídate de esperar días por una primera selección.",
              },
              {
                icon: <ShieldCheck size={20} className="text-[#25D366]" />,
                title: "Privacidad garantizada",
                desc: "Datos cifrados en tránsito y en reposo. Cumplimiento con LFPDPPP, GDPR y normativas locales de protección de datos.",
              },
              {
                icon: <BarChart3 size={20} className="text-[#25D366]" />,
                title: "Dashboard en tiempo real",
                desc: "Métricas de reclutamiento, tiempo de contratación y conversiones en un panel web limpio e intuitivo.",
              },
              {
                icon: <Link2 size={20} className="text-[#25D366]" />,
                title: "Integración con tu ATS",
                desc: "Conéctalo con Workday, BambooHR, Greenhouse y más. Sync automático de candidatos, estados y pipelines.",
              },
              {
                icon: <Globe size={20} className="text-[#25D366]" />,
                title: "Talento global, contexto local",
                desc: "Filtra por ubicación, zona horaria, idiomas, disponibilidad de viaje y modalidad de trabajo.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="scroll-reveal p-6 rounded-2xl border border-neutral-200 bg-white hover:border-[#25D366]/35 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="mb-5 w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/18 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-700 mb-2 text-[15px] tracking-tight text-[#111110]">
                  {f.title}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        id="clientes"
        className="py-32 px-6 md:px-14 border-y border-neutral-100 bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              Clientes
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-800 tracking-[-0.02em] text-[#111110]">
              Lo que dicen quienes ya contratan con Jalector
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Laura G.",
                role: "HR Manager · TechMX",
                quote:
                  "En dos días encontramos a un senior dev que llevábamos meses buscando. El match fue perfecto desde el primer intento.",
                avatar: "#FF6B6B",
              },
              {
                name: "Diego R.",
                role: "CEO · Fintech Startup",
                quote:
                  "Jalector reemplazó el 80% de nuestro proceso de screening. La IA hace el trabajo pesado mientras nosotros cerramos tratos.",
                avatar: "#4ECDC4",
              },
              {
                name: "Sofía M.",
                role: "Talent Lead · E-commerce",
                quote:
                  "La simplicidad de usar WhatsApp hace que todo el equipo lo adopte sin resistencia. Cero curva de aprendizaje.",
                avatar: "#96CEB4",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="scroll-reveal p-7 rounded-2xl border border-neutral-200 bg-[#f8f8f6] flex flex-col justify-between gap-6 hover:border-neutral-300 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="#25D366"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: t.avatar }}
                  >
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-[#111110]">
                      {t.name}
                    </p>
                    <p className="text-neutral-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clarios ── */}
      <section
        id="clarios"
        className="py-32 px-6 md:px-14 relative overflow-hidden"
        style={{ background: "#EDE8DF" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-175 h-175 rounded-full blur-[120px]"
            style={{ background: "rgba(11,49,33,0.06)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-125 h-125 rounded-full blur-[80px]"
            style={{ background: "rgba(11,49,33,0.04)" }}
          />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-14">
            <div
              className="h-px w-14"
              style={{ background: "rgba(11,49,33,0.25)" }}
            />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: "rgba(11,49,33,0.45)" }}
            >
              Ecosistema Jalector
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-9">
              <div>
                <p
                  className="font-display font-800 tracking-[-0.05em] leading-none mb-4"
                  style={{
                    fontSize: "clamp(5rem, 12vw, 7.5rem)",
                    color: "#0B3121",
                  }}
                >
                  Clarios
                </p>
                <h2
                  className="font-display text-xl font-600 leading-snug"
                  style={{ color: "rgba(11,49,33,0.6)" }}
                >
                  Inteligencia de mercado laboral
                  <br />
                  en tiempo real
                </h2>
              </div>

              <p
                className="leading-relaxed text-[15px]"
                style={{ color: "rgba(11,49,33,0.5)" }}
              >
                Analiza tendencias salariales, disponibilidad de talento,
                movimientos de mercado y benchmarks de compensación — todo para
                que tomes decisiones de contratación con datos duros.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "14M+", label: "Registros de empleo" },
                  { value: "380+", label: "Perfiles de puesto" },
                  { value: "Tiempo real", label: "Actualización de datos" },
                  { value: "México", label: "Cobertura regional" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 rounded-2xl backdrop-blur-sm"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(11,49,33,0.08)",
                    }}
                  >
                    <p
                      className="font-display text-xl font-800 tracking-tight"
                      style={{ color: "#0B3121" }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(11,49,33,0.4)" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <a
                  href="https://wa.me/5215564329548?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Clarios%20by%20Jalector"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#0B3121", color: "#EDE8DF" }}
                >
                  <WhatsAppIcon size={15} />
                  Contactar por WhatsApp
                </a>
                <a
                  href="https://wa.me/5215564329548?text=Hola%2C%20quisiera%20ver%20una%20demo%20de%20Clarios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "rgba(11,49,33,0.45)" }}
                >
                  Solicitar demo →
                </a>
              </div>
            </div>

            {/* Right — Research dashboard mockup */}
            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "#0B3121",
                  boxShadow:
                    "0 40px 80px rgba(11,49,33,0.28), 0 8px 20px rgba(11,49,33,0.14)",
                }}
              >
                {/* Header */}
                <div
                  className="px-5 pt-5 pb-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D]" />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Clarios · Informe de mercado
                    </span>
                  </div>
                  <span
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Abr 2026
                  </span>
                </div>

                <div className="p-5 space-y-6">
                  {/* Salary bar chart */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p
                        className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Tendencia salarial · Dev Senior
                      </p>
                      <span className="text-[11px] font-semibold text-[#4CAF7D]">
                        +12.4% YoY
                      </span>
                    </div>
                    <div className="flex items-end gap-1 h-14">
                      {[42, 48, 38, 55, 58, 52, 66, 60, 74, 78, 70, 100].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm"
                            style={{
                              height: `${h}%`,
                              background:
                                i === 11
                                  ? "#4CAF7D"
                                  : `rgba(76,175,125,${0.15 + i * 0.055})`,
                            }}
                          />
                        ),
                      )}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span
                        className="text-[9px]"
                        style={{ color: "rgba(255,255,255,0.18)" }}
                      >
                        Abr &#39;25
                      </span>
                      <span
                        className="text-[9px]"
                        style={{ color: "rgba(255,255,255,0.18)" }}
                      >
                        Mar &#39;26
                      </span>
                    </div>
                  </div>

                  {/* Talent availability */}
                  <div>
                    <p
                      className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      Disponibilidad de talento
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { role: "Frontend React", pct: 78 },
                        { role: "Data Engineer", pct: 34 },
                        { role: "Product Designer", pct: 56 },
                      ].map((r) => (
                        <div key={r.role}>
                          <div className="flex justify-between mb-1">
                            <span
                              className="text-[11px]"
                              style={{ color: "rgba(255,255,255,0.55)" }}
                            >
                              {r.role}
                            </span>
                            <span
                              className="text-[11px]"
                              style={{ color: "rgba(255,255,255,0.35)" }}
                            >
                              {r.pct}%
                            </span>
                          </div>
                          <div
                            className="h-1 rounded-full"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            <div
                              className="h-1 rounded-full bg-[#4CAF7D]"
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latest insight card */}
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(76,175,125,0.15)" }}
                      >
                        <TrendingUp size={13} className="text-[#4CAF7D]" />
                      </div>
                      <div>
                        <p
                          className="text-[11px] font-medium"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          Salario mediano CDMX · Full Stack
                        </p>
                        <p className="font-display text-2xl font-800 text-white mt-0.5">
                          $62,500 MXN
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p
                            className="text-[10px]"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            Promedio de 1,240 ofertas activas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div
                    className="flex items-center justify-between pt-1"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        size={10}
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        CDMX · Monterrey · Guadalajara
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileBarChart2
                        size={10}
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        847 informes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{
                  background: "#4CAF7D",
                  color: "#0B3121",
                  boxShadow: "0 4px 12px rgba(76,175,125,0.4)",
                }}
              >
                Beta
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — dark section for contrast ── */}
      <section
        id="demo"
        className="py-40 px-6 text-center relative overflow-hidden bg-[#111110]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-175 h-87.5 bg-[#25D366]/8 rounded-full blur-[100px]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-100 h-50 bg-[#25D366]/5 rounded-full blur-[60px]" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium mb-2 tracking-wide">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D]"
              style={{ boxShadow: "0 0 0 3px rgba(76,175,125,0.25)" }}
            />
            Clarios ya está disponible
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-800 leading-tight tracking-[-0.02em] text-white">
            Inteligencia de mercado laboral a tu alcance
          </h2>
          <p className="text-white/45 text-lg">
            Benchmarks salariales, disponibilidad de talento y tendencias de
            mercado — directo a tu WhatsApp.
          </p>
          <a
            href="https://wa.me/5215564329548?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Clarios%20by%20Jalector"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer inline-flex items-center gap-3 px-12 py-5 rounded-full bg-[#25D366] text-[#111110] font-bold text-[17px] hover:bg-[#1fbe5a] transition-all hover:shadow-[0_8px_40px_rgba(37,211,102,0.45)]"
          >
            <WhatsAppIcon size={20} />
            Contactar ahora
          </a>
          <p className="text-white/25 text-xs pt-2">
            +52 1 55 6432 9548 · Respuesta en minutos
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 md:px-14 border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <img src="/jalector.svg" alt="Jalector" className="h-6 w-auto" />
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-neutral-400">
              <a
                href="#como-funciona"
                className="hover:text-neutral-700 transition-colors"
              >
                Cómo funciona
              </a>
              <a
                href="#funciones"
                className="hover:text-neutral-700 transition-colors"
              >
                Funciones
              </a>
              <a
                href="#clientes"
                className="hover:text-neutral-700 transition-colors"
              >
                Clientes
              </a>
              <a
                href="#demo"
                className="hover:text-neutral-700 transition-colors"
              >
                Demo
              </a>
            </nav>
            <div className="flex gap-5 text-xs text-neutral-400">
              <a href="#" className="hover:text-neutral-700 transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-neutral-700 transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-neutral-700 transition-colors">
                Contacto
              </a>
            </div>
          </div>
          <div className="pt-6 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-neutral-400 text-xs">
              © 2026 Jalector · jalector.com · Todos los derechos reservados.
            </p>
            <p className="text-neutral-300 text-xs">
              Reclutamiento inteligente por WhatsApp · México
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
