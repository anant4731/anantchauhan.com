export type Project = {
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  // Accent hue (0-360) used for the card glow and case-study header.
  hue: number;
  links: { label: string; href: string }[];
  note?: string;
  overview: string;
  sections: { heading: string; body?: string; points?: string[] }[];
};

export const projects: Project[] = [
  {
    slug: "private-investment-portal",
    name: "Private Investment Portal",
    tagline:
      "A single-user, security-first portal that tracks crypto, Indian mutual funds and NSE/BSE stocks, and calls my phone when the market dips.",
    stack: ["Next.js 16", "TypeScript", "PostgreSQL", "Drizzle", "Docker", "Caddy", "AWS EC2", "GitHub Actions"],
    hue: 158,
    links: [],
    note: "The code is private because it runs against my own accounts. I'm happy to walk through it in an interview.",
    overview:
      "I wanted alerts I couldn't sleep through when a position moved sharply, and I didn't want my holdings sitting in a third-party app. So I built my own portal, treated it like a production service, and deployed it behind my own domain.",
    sections: [
      {
        heading: "What it does",
        points: [
          "Tracks holdings across crypto (CoinGecko), Indian mutual funds (MFAPI) and NSE/BSE stocks (Upstox) behind a pluggable price-provider interface.",
          "Average-cost holdings with realised and unrealised P&L, plus CSV import of past transactions.",
          "Alert rules for sharp dips or spikes within a window, 24h change thresholds and price targets.",
          "Alerts go out as Telegram messages with Acknowledge and Mute buttons, and escalate to a voice call for the serious ones.",
        ],
      },
      {
        heading: "Alerting that doesn't cry wolf",
        points: [
          "Edge-triggered evaluation with per-rule cooldowns, so a sustained dip fires once instead of every minute.",
          "Quiet hours and a daily summary, all in IST.",
          "A background worker holds a Postgres advisory lock, so only one instance evaluates rules even if two are running.",
          "A dead-man's-switch ping tells me if the worker itself stops.",
        ],
      },
      {
        heading: "Security, as if it held someone else's money",
        points: [
          "Mandatory TOTP 2FA, Argon2id password hashing and database-backed sessions.",
          "Login rate limiting and lockout, keyed on the client IP that the reverse proxy overwrites, so it can't be spoofed.",
          "Nonce-based Content Security Policy, CSRF origin checks on every mutation, and an audit log.",
          "Third-party API tokens encrypted at rest. Postgres is bound to loopback only, and containers run read-only with all capabilities dropped.",
        ],
      },
      {
        heading: "Shipping it",
        points: [
          "CI runs lint, typecheck, tests and a build on every push. Merges to main build an image to GHCR.",
          "Deploys use GitHub OIDC → a narrowly scoped AWS role → SSM Run Command. There are no SSH keys and no long-lived AWS credentials in CI.",
          "The deploy script health-checks the new containers and rolls back automatically if they fail.",
        ],
      },
    ],
  },
  {
    slug: "investment-tracker",
    name: "Investment Tracker Platform",
    tagline:
      "A real-time crypto portfolio tracker with live Binance ingestion and Golang services for rate limiting, order syncing and P&L reconciliation.",
    stack: ["Next.js", "Golang", "Binance APIs", "Chart.js"],
    hue: 42,
    links: [
      { label: "Live demo", href: "https://investment-tracker-murex.vercel.app" },
      { label: "GitHub", href: "https://github.com/anant4731/investment-tracker" },
    ],
    overview:
      "A crypto portfolio tracker that streams live prices from Binance into the UI, with Golang services doing the heavy lifting behind it.",
    sections: [
      {
        heading: "Highlights",
        points: [
          "Live Binance ingestion with sub-second UI updates.",
          "Golang services for rate limiting, order syncing and P&L reconciliation.",
          "Charts built with Chart.js.",
        ],
      },
    ],
  },
  {
    slug: "triponest",
    name: "Triponest",
    tagline: "An enterprise travel and flight concierge platform, built as a Turborepo monorepo of micro-frontends.",
    stack: ["Next.js", "Turborepo", "React", "Tailwind"],
    hue: 205,
    links: [],
    overview:
      "An enterprise travel and flight concierge platform, structured so that each product area can ship on its own.",
    sections: [
      {
        heading: "Highlights",
        points: [
          "Turborepo monorepo with independently deployable micro-frontends.",
          "Shared packages for UI and utilities, with strictly typed API contracts between apps.",
        ],
      },
    ],
  },
  {
    slug: "rag-document-intelligence",
    name: "RAG Document Intelligence",
    tagline: "A retrieval-augmented search tool over publishing content, serving 200 QPS in production.",
    stack: ["OpenAI", "ChromaDB", "Node.js", "AWS"],
    hue: 280,
    links: [],
    note: "Built at Compro Technologies. The code is proprietary.",
    overview:
      "A document intelligence tool for the CUP platform that combines an OpenAI LLM with ChromaDB vector search to answer questions over large document sets.",
    sections: [
      {
        heading: "Highlights",
        points: [
          "RAG pipeline: OpenAI LLM + ChromaDB vector store.",
          "Supports 200 QPS in production.",
          "Improved search accuracy across the CUP platform.",
        ],
      },
    ],
  },
  {
    slug: "blockchain-document-management",
    name: "Blockchain Document Management",
    tagline: "Tamper-proof university records on Ethereum, with role-based access and verifiable audit trails.",
    stack: ["Solidity", "Ethereum", "Smart Contracts"],
    hue: 320,
    links: [],
    note: "Built during my internship at Manav Rachna University.",
    overview:
      "A document management system for the university that stores records on Ethereum, so anyone can verify them and no one can alter them quietly.",
    sections: [
      {
        heading: "Highlights",
        points: [
          "Immutable on-chain storage with role-based access control in Solidity.",
          "Secures 5,000+ records with verifiable audit trails.",
        ],
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
