import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { PageShell } from "@/components/page-shell";
import { Spotlight } from "@/components/spotlight";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Anant Chauhan: distributed systems, LLM tooling and full-stack products.",
};

export default function ProjectsPage() {
  return (
    <PageShell
      wide
      eyebrow="Projects"
      title={
        <>
          Things I&apos;ve <span className="font-serif font-normal italic text-gradient">built</span>.
        </>
      }
      intro="Side projects I run myself, and work I shipped at my jobs. Each one links to a short write-up of how it works."
    >
      <ul className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.slug} className={i === 0 ? "md:col-span-2" : undefined}>
            <Spotlight hue={p.hue} className="panel group h-full rounded-3xl transition hover:border-white/25">
              <Link href={`/projects/${p.slug}`} className="flex h-full flex-col p-6 sm:p-7">
                <div
                  aria-hidden
                  className="mb-6 h-1.5 w-16 rounded-full"
                  style={{ background: `linear-gradient(90deg, hsl(${p.hue} 85% 65%), hsl(${p.hue + 60} 85% 70%))` }}
                />
                <div className="flex items-start justify-between gap-4">
                  <h2 className={`font-semibold tracking-tight ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                    {p.name}
                  </h2>
                  <ArrowIcon className="mt-1 size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-3 flex-1 leading-relaxed text-foreground/70">{p.tagline}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </Link>
            </Spotlight>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
