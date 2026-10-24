import Link from "next/link";
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { HeroScene } from "@/components/scene/hero-scene";
import { ScrambleText } from "@/components/scramble-text";
import { Spotlight } from "@/components/spotlight";
import { projects } from "@/content/projects";
import { experience, highlights } from "@/content/resume";
import { site } from "@/content/site";

const pillars = [
  {
    title: "Distributed systems",
    body: "Event pipelines on Kafka, DynamoDB data models and Go services. Right now: a DynamoDB-compatible database service at Amazon.",
    tags: ["Kafka", "DynamoDB", "Golang", "AWS"],
    hue: 200,
  },
  {
    title: "AI & LLMs",
    body: "Production RAG and LLM tooling, plus adversarial evaluations and red-teaming used to train frontier models.",
    tags: ["RAG", "OpenAI", "ChromaDB", "Evals"],
    hue: 270,
  },
  {
    title: "Product engineering",
    body: "Interfaces people actually use: Next.js apps, drag-and-drop builders and shared component libraries.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    hue: 165,
  },
];

const featured = projects.slice(0, 3);

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{children}</p>;
}

export default function Home() {
  return (
    <>
      <HeroScene />

      {/* 0 · Name in particles */}
      <section data-scene className="relative flex min-h-svh flex-col items-center justify-end px-6 pb-[12svh] text-center">
        <h1 className="hero-name mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">{site.name}</h1>
        <ScrambleText
          text={`${site.role} · Amazon`}
          delay={900}
          className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase sm:text-sm sm:tracking-[0.2em]"
        />
        <p className="mt-4 max-w-xl text-lg text-balance text-foreground/80 sm:text-xl">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition hover:bg-accent"
          >
            See my work
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link href="/resume" className="panel rounded-full px-5 py-2.5 font-medium transition hover:border-white/30">
            Resume
          </Link>
        </div>
        <p className="float-hint mt-12 font-mono text-[11px] tracking-widest text-muted uppercase">
          scroll · or click anywhere
        </p>
      </section>

      {/* 1 · Network globe */}
      <section data-scene className="flex min-h-svh items-center px-6 py-24">
        <div className="mx-auto w-full max-w-5xl">
          <div className="reveal max-w-xl">
            <Eyebrow>What I do</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Systems that scale, <span className="font-serif font-normal italic text-gradient">and the products</span>{" "}
              on top of them.
            </h2>
          </div>
          <div className="mt-10 grid max-w-xl gap-4">
            {pillars.map((p) => (
              <Spotlight key={p.title} hue={p.hue} className="reveal panel rounded-2xl p-5">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{p.body}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <li key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </Spotlight>
            ))}
          </div>
        </div>
      </section>

      {/* 2 · Galaxy */}
      <section data-scene className="flex min-h-svh items-center px-6 py-24">
        <div className="mx-auto w-full max-w-5xl">
          <div className="reveal max-w-xl">
            <Eyebrow>Impact</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Numbers I&apos;ve <span className="font-serif font-normal italic text-gradient">moved</span>.
            </h2>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-4">
            {highlights.map((h) => (
              <div key={h.value} className="reveal panel rounded-2xl p-5">
                <dt className="sr-only">{h.label}</dt>
                <dd>
                  <span className="block text-3xl font-bold tracking-tight text-gradient sm:text-4xl">{h.value}</span>
                  <span className="mt-2 block text-sm leading-snug text-foreground/70">{h.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <ol className="reveal panel mt-4 max-w-xl rounded-2xl p-5 text-sm">
            {experience
              .filter((r) => !r.company.startsWith("AI Training"))
              .map((r) => (
                <li key={r.company} className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0">
                  <span>
                    <span className="font-medium">{r.company}</span>
                    <span className="text-muted"> · {r.title}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted">{r.period}</span>
                </li>
              ))}
          </ol>
        </div>
      </section>

      {/* 3 · Torus knot */}
      <section data-scene className="flex min-h-svh items-center px-6 py-24">
        <div className="mx-auto w-full max-w-5xl">
          <div className="reveal max-w-xl">
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Things I&apos;ve <span className="font-serif font-normal italic text-gradient">built</span>.
            </h2>
          </div>
          <div className="mt-10 grid max-w-xl gap-4">
            {featured.map((p) => (
              <Spotlight key={p.slug} hue={p.hue} className="reveal panel group rounded-2xl transition hover:border-white/25">
                <Link href={`/projects/${p.slug}`} className="block p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <ArrowIcon className="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{p.tagline}</p>
                  <p className="mt-3 font-mono text-[11px] text-muted">{p.stack.slice(0, 5).join(" · ")}</p>
                </Link>
              </Spotlight>
            ))}
          </div>
          <Link href="/projects" className="reveal mt-6 inline-flex items-center gap-2 text-sm text-accent hover:underline">
            All projects <ArrowIcon className="size-4" />
          </Link>
        </div>
      </section>

      {/* 4 · Wave grid */}
      <section data-scene className="flex min-h-svh flex-col items-center justify-center px-6 pt-24 pb-[30svh] text-center">
        <div className="reveal">
          <Eyebrow>Contact</Eyebrow>
          <h2 className="mt-4 text-5xl font-bold tracking-tight text-balance sm:text-7xl">
            Let&apos;s build <span className="font-serif font-normal italic text-gradient">something</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-foreground/70">
            I&apos;m always happy to talk about distributed systems, LLM tooling or an interesting role.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition hover:bg-accent"
            >
              <MailIcon className="size-4" /> Email me
            </a>
            <a href={site.links.linkedin} className="panel inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium transition hover:border-white/30">
              <LinkedInIcon className="size-4" /> LinkedIn
            </a>
            <a href={site.links.github} className="panel inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium transition hover:border-white/30">
              <GitHubIcon className="size-4" /> GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
