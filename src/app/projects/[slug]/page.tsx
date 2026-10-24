import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.tagline };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <ProjectDetails params={params} />
    </Suspense>
  );
}

// Reads the URL, so it sits inside Suspense and the route's shared shell stays URL-independent.
async function ProjectDetails({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const glow = `hsl(${project.hue} 85% 60% / 0.22)`;

  return (
    <article className="relative min-h-svh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
        style={{ background: `radial-gradient(50rem 26rem at 70% -5%, ${glow}, transparent 70%)` }}
      />
      <div className="relative mx-auto max-w-3xl px-6 pt-32 pb-24">
        <Link href="/projects" className="font-mono text-xs tracking-[0.2em] text-muted uppercase hover:text-foreground">
          ← All projects
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">{project.name}</h1>
        <p className="mt-5 text-lg leading-relaxed text-foreground/75 sm:text-xl">{project.tagline}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
              {s}
            </li>
          ))}
        </ul>

        {(project.links.length > 0 || project.note) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-accent"
              >
                {l.label}
                <ArrowIcon className="size-4" />
              </a>
            ))}
            {project.note && <p className="text-sm text-muted">{project.note}</p>}
          </div>
        )}

        <p className="mt-14 text-lg leading-relaxed text-foreground/85">{project.overview}</p>

        {project.sections.map((s) => (
          <section key={s.heading} className="mt-12">
            <h2 className="text-2xl font-semibold tracking-tight">{s.heading}</h2>
            {s.body && <p className="mt-3 leading-relaxed text-foreground/75">{s.body}</p>}
            {s.points && (
              <ul className="mt-4 space-y-3">
                {s.points.map((pt) => (
                  <li key={pt} className="flex gap-3 leading-relaxed text-foreground/75">
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rounded-full"
                      style={{ background: `hsl(${project.hue} 85% 65%)` }}
                    />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <Link
          href={`/projects/${next.slug}`}
          className="panel group mt-20 flex items-center justify-between rounded-2xl p-6 transition hover:border-white/25"
        >
          <span>
            <span className="block font-mono text-xs tracking-[0.2em] text-muted uppercase">Next project</span>
            <span className="mt-1 block text-xl font-semibold">{next.name}</span>
          </span>
          <ArrowIcon className="size-5 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </Link>
      </div>
    </article>
  );
}
