import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { PrintButton } from "@/components/print-button";
import { achievements, education, experience, resumeProjects, skills, summary } from "@/content/resume";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${site.name}, ${site.role}.`,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-6 first:border-0 first:pt-0 print:pt-2">
      <h2 className="font-mono text-xs tracking-[0.25em] text-accent uppercase print:text-[9pt] print:text-black">
        {title}
      </h2>
      <div className="mt-4 print:mt-2">{children}</div>
    </section>
  );
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function ResumePage() {
  return (
    <PageShell
      eyebrow="Resume"
      title={site.name}
      intro={
        <div className="flex flex-wrap items-center gap-3">
          <PrintButton />
          <span className="text-sm text-muted">Prints as a clean one-page A4.</span>
        </div>
      }
    >
      <div className="panel print-plain space-y-8 rounded-3xl p-6 sm:p-10 print:space-y-2">
        <header>
          <p className="hidden text-2xl font-bold print:block">{site.name}</p>
          <p className="text-lg font-medium">
            {site.role} · {site.location}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <a href={`mailto:${site.email}`} className="hover:text-foreground">
              {site.email}
            </a>
            <a href={site.links.linkedin} className="hover:text-foreground">
              {stripProtocol(site.links.linkedin)}
            </a>
            <a href={site.links.github} className="hover:text-foreground">
              {stripProtocol(site.links.github)}
            </a>
            <a href={site.url} className="hover:text-foreground">
              {stripProtocol(site.url)}
            </a>
          </p>
        </header>

        <Section title="Summary">
          <p className="leading-relaxed text-foreground/85">{summary}</p>
        </Section>

        <Section title="Experience">
          <div className="space-y-7 print:space-y-3">
            {experience.map((role) => (
              <article key={`${role.company}-${role.period}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold">
                    {role.company} <span className="font-normal text-muted">· {role.title}</span>
                  </h3>
                  <p className="font-mono text-xs text-muted">
                    {role.period} · {role.location}
                  </p>
                </div>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/80 print:space-y-0.5">
                  {role.points.map((pt) => (
                    <li key={pt} className="flex gap-2.5">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent print:bg-black" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Projects">
          <div className="space-y-4 print:space-y-2">
            {resumeProjects.map((p) => (
              <article key={p.name}>
                <h3 className="font-semibold">
                  {p.name} <span className="font-mono text-xs font-normal text-muted">· {p.stack}</span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{p.point}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Skills">
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[9rem_1fr] print:grid-cols-[8rem_1fr] print:gap-y-0.5">
            {skills.map((s) => (
              <div key={s.label} className="contents">
                <dt className="font-medium text-foreground/90">{s.label}</dt>
                <dd className="text-foreground/75">{s.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Achievements">
          <ul className="space-y-1 text-sm text-foreground/80">
            {achievements.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>

        <Section title="Education">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-semibold">{education.school}</h3>
            <p className="font-mono text-xs text-muted">
              {education.period} · {education.location}
            </p>
          </div>
          <p className="mt-1 text-sm text-foreground/80">{education.degree}</p>
        </Section>
      </div>
    </PageShell>
  );
}
