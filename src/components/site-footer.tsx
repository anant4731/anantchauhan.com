import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>
          {site.name} · {site.location}
        </p>
        <div className="flex items-center gap-5">
          <a href={`mailto:${site.email}`} className="hover:text-foreground" aria-label="Email">
            <MailIcon className="size-5" />
          </a>
          <a href={site.links.github} className="hover:text-foreground" aria-label="GitHub" rel="me">
            <GitHubIcon className="size-5" />
          </a>
          <a href={site.links.linkedin} className="hover:text-foreground" aria-label="LinkedIn" rel="me">
            <LinkedInIcon className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
