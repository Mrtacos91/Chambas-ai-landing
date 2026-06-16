import Link from "next/link";

type InfoPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function InfoPage({
  title,
  eyebrow,
  description,
  sections,
}: InfoPageProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-16 text-[var(--foreground)] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="footer-link">
          ← Volver a Jalector
        </Link>
        <p className="eyebrow mt-12">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-800 leading-tight tracking-normal md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
          {description}
        </p>

        <div className="mt-12 space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
            >
              <h2 className="font-display text-2xl font-800 tracking-normal">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
