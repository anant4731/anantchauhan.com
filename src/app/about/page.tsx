import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { PageShell } from "@/components/page-shell";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}: background, how I work, and what I'm building now.`,
};

const path = [
  {
    when: "2023",
    where: "Manav Rachna University",
    what: "First production code: a blockchain document system in Solidity, protecting 5,000+ university records.",
  },
  {
    when: "2023–24",
    where: "Portalify",
    what: "Moved to product work: drag-and-drop form and email builders, and the component library behind them.",
  },
  {
    when: "2024–26",
    where: "Compro Technologies",
    what: "Went deep on the backend: Kafka at 5M+ events a day, DynamoDB redesigns, a RAG search tool at 200 QPS, and the CI/CD to ship it all.",
  },
  {
    when: "Now",
    where: "Amazon",
    what: "Building a DynamoDB-compatible database service in Go and a managed egress-proxy offering. On the side, I red-team frontier LLMs as an AI trainer.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title={
        <>
          Hi, I&apos;m Anant. I like systems that <span className="font-serif font-normal italic text-gradient">don&apos;t fall over</span>.
        </>
      }
      intro={
        <p>
          I&apos;m a software engineer in New Delhi. I started out building interfaces, then kept following the
          problems down the stack: queues, databases and, lately, how large language models fail.
        </p>
      }
    >
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">The path so far</h2>
        <ol className="relative mt-8 space-y-8 border-l border-line pl-8">
          {path.map((step) => (
            <li key={step.where} className="relative">
              <span
                aria-hidden
                className="absolute top-1.5 -left-[37px] size-2.5 rounded-full bg-gradient-to-br from-accent to-accent-2 ring-4 ring-background"
              />
              <p className="font-mono text-xs tracking-widest text-muted uppercase">{step.when}</p>
              <h3 className="mt-1 text-lg font-semibold">{step.where}</h3>
              <p className="mt-1 leading-relaxed text-foreground/75">{step.what}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">How I work</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Measure it", "Latency, throughput and error rates come before and after every change I make."],
            ["Ship it safely", "CI/CD, health checks and rollbacks are part of the feature, not an afterthought."],
            ["Assume it breaks", "I design for retries, idempotency and the failure case, and test them on purpose."],
          ].map(([title, body]) => (
            <div key={title} className="panel rounded-2xl p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Away from the keyboard</h2>
        <p className="mt-4 leading-relaxed text-foreground/75">
          I&apos;m a national-level athlete, and the habits carry over: steady practice, honest feedback and showing up
          on the days it&apos;s hard. That&apos;s also how I got through 800+ LeetCode problems.
        </p>
      </section>

      <section className="panel mt-16 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Say hello</h2>
        <p className="mt-2 text-foreground/70">The fastest way to reach me is email.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition hover:bg-accent"
          >
            <MailIcon className="size-4" /> {site.email}
          </a>
          <a href={site.links.linkedin} className="panel inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium">
            <LinkedInIcon className="size-4" /> LinkedIn
          </a>
          <a href={site.links.github} className="panel inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium">
            <GitHubIcon className="size-4" /> GitHub
          </a>
        </div>
        <Link href="/resume" className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
          Or read the full resume <ArrowIcon className="size-4" />
        </Link>
      </section>
    </PageShell>
  );
}
