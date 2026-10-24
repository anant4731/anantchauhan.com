"use client";

import { DownloadIcon } from "@/components/icons";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-accent"
    >
      <DownloadIcon className="size-4" />
      Save as PDF
    </button>
  );
}
