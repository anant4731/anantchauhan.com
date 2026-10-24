import type { ReactNode } from "react";

// Layout for the inner pages: static gradient backdrop, no WebGL.
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="backdrop relative min-h-svh">
      <div aria-hidden className="no-print backdrop-grid pointer-events-none absolute inset-x-0 top-0 h-[38rem]" />
      <div className={`relative mx-auto px-6 pt-32 pb-24 print:max-w-none print:px-0 print:pt-0 print:pb-0 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        <header className="no-print">
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-6xl">{title}</h1>
          {intro && <div className="mt-5 max-w-2xl text-lg text-foreground/70">{intro}</div>}
        </header>
        <div className="mt-14 print:mt-0">{children}</div>
      </div>
    </div>
  );
}
