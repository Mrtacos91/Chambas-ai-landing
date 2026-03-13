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
    <main className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-14 border-b border-white/6 backdrop-blur-md bg-[#080808]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center text-white">
            <WhatsAppIcon size={17} />
          </div>
          <span className="text-base font-bold tracking-tight">Chambas AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a
            href="#como-funciona"
            className="hover:text-white transition-colors"
          >
            Cómo funciona
          </a>
          <a href="#funciones" className="hover:text-white transition-colors">
            Funciones
          </a>
          <a href="#clientes" className="hover:text-white transition-colors">
            Clientes
          </a>
        </div>

        <a
          href="#demo"
          className="px-5 py-2 rounded-full bg-[#25D366] text-[#080808] text-sm font-semibold hover:bg-[#1fbe5a] transition-all hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]"
        >
          Solicitar demo
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-225 h-125 bg-[#25D366]/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-125 h-125 bg-[#25D366]/4 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-24">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#25D366]/25 bg-[#25D366]/8 text-[#25D366] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              Reclutamiento impulsado por IA · Disponible 24/7
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.06] tracking-tight">
              Contrata el mejor talento a través de{" "}
              <span className="text-[#25D366]">WhatsApp</span>
            </h1>

            <p className="text-lg text-white/45 leading-relaxed max-w-105">
              Un agente conversacional que entiende lo que buscas, filtra miles
              de candidatos y te presenta únicamente los perfiles que encajan —
              directamente en tu chat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#demo"
                className="px-8 py-4 rounded-full bg-[#25D366] text-[#080808] font-semibold text-[15px] hover:bg-[#1fbe5a] transition-all hover:shadow-[0_0_40px_rgba(37,211,102,0.35)] text-center"
              >
                Empezar gratis
              </a>
              <a
                href="#como-funciona"
                className="px-8 py-4 rounded-full border border-white/12 text-white/60 font-medium text-[15px] hover:border-white/30 hover:text-white transition-all text-center"
              >
                Ver cómo funciona →
              </a>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {(
                  [
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#96CEB4",
                    "#FFBE76",
                  ] as const
                ).map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#080808]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm text-white/40">
                <span className="text-white font-semibold">+500 empresas</span>{" "}
                ya contratan con Chambas AI
              </p>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="animate-float relative">
              {/* Glow behind phone */}
              <div className="absolute -inset-6 bg-[#25D366]/10 rounded-[50px] blur-2xl" />

              {/* Phone shell */}
              <div className="relative w-75 sm:w-80 rounded-[40px] bg-[#111] border border-white/10 shadow-2xl overflow-hidden glow-card">
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

                {/* WhatsApp header bar */}
                <div className="bg-[#075E54] px-4 pb-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    CA
                  </div>
                  <div>
                    <p className="text-white text-[13px] font-semibold leading-tight">
                      Chambas AI
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
                  {/* Bot */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-[#111] text-[11px] leading-relaxed flex items-center gap-1 flex-wrap">
                        <Hand
                          size={11}
                          className="inline text-[#075E54] shrink-0"
                        />
                        Hola! Soy Chambas AI. ¿Qué perfil de candidato necesitas
                        hoy?
                      </p>
                      <p className="text-[#aaa] text-[9px] text-right mt-0.5">
                        9:41
                      </p>
                    </div>
                  </div>

                  {/* User */}
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

                  {/* Bot searching */}
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

                  {/* Bot result card */}
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

      {/* ── Stats bar ── */}
      <section className="border-y border-white/6 py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,847", label: "Candidatos activos" },
            { value: "500+", label: "Empresas usuarias" },
            { value: "94%", label: "Tasa de match" },
            { value: "48 h", label: "Tiempo promedio de contratación" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-[#25D366] tabular-nums">
                {s.value}
              </p>
              <p className="text-xs text-white/35 mt-1.5 leading-snug">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="como-funciona" className="py-28 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              El proceso
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Tan simple como enviar un mensaje
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                icon: <MessageSquare size={26} className="text-[#25D366]" />,
                title: "Describe lo que buscas",
                desc: "Escríbele al bot en lenguaje natural. El puesto, las habilidades, el nivel de experiencia y el tipo de contrato. Sin formularios ni filtros complejos.",
              },
              {
                step: "02",
                icon: <Bot size={26} className="text-[#25D366]" />,
                title: "La IA evalúa y filtra",
                desc: "Nuestro motor analiza miles de perfiles en segundos, evalúa hard skills, experiencia, zona horaria y compatibilidad cultural.",
              },
              {
                step: "03",
                icon: <Target size={26} className="text-[#25D366]" />,
                title: "Recibe candidatos listos",
                desc: "El bot te presenta los mejores perfiles con un resumen ejecutivo. Tú decides a quién contactar — todo desde WhatsApp.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-7 rounded-2xl border border-white/7 bg-white/2 hover:border-[#25D366]/30 hover:bg-[#25D366]/3 transition-all group"
              >
                <span className="absolute top-5 right-6 text-7xl font-black text-white/4 group-hover:text-[#25D366]/8 transition-colors select-none leading-none">
                  {item.step}
                </span>
                <div className="mb-5">{item.icon}</div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conversation flow showcase ── */}
      <section className="py-28 px-6 md:px-14 bg-white/1.5 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left copy */}
          <div className="space-y-7">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              Flujo de conversación
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Recluta como si chateases con un headhunter experto
            </h2>
            <p className="text-white/45 leading-relaxed">
              Chambas AI entiende el contexto, hace las preguntas correctas y
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
                  className="flex items-center gap-3 text-sm text-white/65"
                >
                  <span className="w-4.5 h-4.5 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Extended chat */}
          <div className="rounded-2xl border border-white/8 bg-[#0f0f0f] overflow-hidden shadow-xl">
            {/* Chat header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold">
                CA
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Chambas AI</p>
                <p className="text-white/55 text-xs">Reclutador IA · 24/7</p>
              </div>
              <div className="ml-auto flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-3">
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
                      Perfecto. Ajustando filtros... He encontrado 12 candidatos
                      con 90%+ de compatibilidad. ¿Ves el top 3?
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
                      #1 — Ana R. · 4 años · React/Node/AWS · Remota LATAM ·
                      Match: 97% · ¿Deseas su CV completo o agendamos una intro
                      call?
                    </span>
                  ),
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                      m.from === "user"
                        ? "bg-[#25D366]/18 text-white rounded-tr-none border border-[#25D366]/20"
                        : "bg-white/5 text-white/75 rounded-tl-none border border-white/6"
                    }`}
                  >
                    {m.msg}
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/6 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="funciones" className="py-28 px-6 md:px-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              Funcionalidades
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Todo lo que necesitas para contratar mejor
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Brain size={22} className="text-[#25D366]" />,
                title: "IA conversacional avanzada",
                desc: "Comprende matices, sinónimos y contexto. No es un bot rígido — entiende como un reclutador experto.",
              },
              {
                icon: <Zap size={22} className="text-[#25D366]" />,
                title: "Respuesta en segundos",
                desc: "Analiza y filtra miles de candidatos en tiempo real. Olvídate de esperar días por una primera selección.",
              },
              {
                icon: <ShieldCheck size={22} className="text-[#25D366]" />,
                title: "Privacidad garantizada",
                desc: "Datos cifrados en tránsito y en reposo. Cumplimiento con LFPDPPP, GDPR y normativas locales de protección de datos.",
              },
              {
                icon: <BarChart3 size={22} className="text-[#25D366]" />,
                title: "Dashboard en tiempo real",
                desc: "Métricas de reclutamiento, tiempo de contratación y conversiones en un panel web limpio e intuitivo.",
              },
              {
                icon: <Link2 size={22} className="text-[#25D366]" />,
                title: "Integración con tu ATS",
                desc: "Conéctalo con Workday, BambooHR, Greenhouse y más. Sync automático de candidatos, estados y pipelines.",
              },
              {
                icon: <Globe size={22} className="text-[#25D366]" />,
                title: "Talento global, contexto local",
                desc: "Filtra por ubicación, zona horaria, idiomas, disponibilidad de viaje y modalidad de trabajo.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-white/7 bg-white/2 hover:border-[#25D366]/25 hover:bg-[#25D366]/3 transition-all"
              >
                <div className="mb-5">{f.icon}</div>
                <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">
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
        className="py-28 px-6 md:px-14 border-y border-white/5 bg-white/1.5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase">
              Clientes
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Lo que dicen quienes ya contratan con Chambas AI
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
                  "Chambas AI reemplazó el 80% de nuestro proceso de screening. La IA hace el trabajo pesado mientras nosotros cerramos tratos.",
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
                className="p-6 rounded-2xl border border-white/7 bg-white/2 flex flex-col justify-between gap-6"
              >
                <p className="text-white/60 text-sm leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full shrink-0"
                    style={{ backgroundColor: t.avatar }}
                  />
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {t.name}
                    </p>
                    <p className="text-white/35 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="demo"
        className="py-36 px-6 text-center relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-175 h-87.5 bg-[#25D366]/7 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#25D366]/25 bg-[#25D366]/8 text-[#25D366] text-xs font-medium mb-2">
            <WhatsAppIcon size={13} />
            Listo para conectar con WhatsApp en minutos
          </div>
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Empieza a contratar smarter hoy
          </h2>
          <p className="text-white/40 text-lg">
            Sin tarjeta de crédito. Sin configuración compleja. Solo escríbele
            al bot.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-[#25D366] text-[#080808] font-bold text-[17px] hover:bg-[#1fbe5a] transition-all hover:shadow-[0_0_60px_rgba(37,211,102,0.4)]"
          >
            <WhatsAppIcon size={20} />
            Solicitar acceso
          </a>
          <p className="text-white/25 text-xs pt-2">
            Más de 500 empresas ya confían en Chambas AI
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 md:px-14 border-t border-white/6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#25D366] flex items-center justify-center text-white">
              <WhatsAppIcon size={13} />
            </div>
            <span className="text-sm font-semibold">Chambas AI</span>
          </div>
          <p className="text-white/25 text-xs">
            © 2026 Chambas AI. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
