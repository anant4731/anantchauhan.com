import Link from "next/link";

export default function NotFound() {
  return (
    <div className="backdrop grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Lost in <span className="font-serif font-normal italic text-gradient">space</span>.
        </h1>
        <p className="mt-4 text-foreground/70">That page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition hover:bg-accent"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}
