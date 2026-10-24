// Single source of truth for /resume and the experience highlights on the
// home page. The phone number is deliberately left out of the public site.

export type Role = {
  company: string;
  title: string;
  period: string;
  location: string;
  points: string[];
};

export const summary =
  "Software Development Engineer at Amazon with 2+ years building event-driven distributed systems (Kafka, AWS, DynamoDB), production RAG/LLM tooling, and adversarial evaluations for training frontier LLMs.";

export const skills: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["C++", "Golang", "JavaScript", "TypeScript", "Solidity"] },
  {
    label: "Frontend",
    items: ["React.js", "Next.js (App Router)", "Vue.js", "HTML", "CSS", "Tailwind CSS v4", "Bootstrap"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express", "REST", "GraphQL", "JWT", "Microservices", "Apache Kafka (Confluent)"],
  },
  { label: "Datastores", items: ["DynamoDB", "MongoDB", "Redis", "ChromaDB"] },
  {
    label: "Cloud / Infra",
    items: [
      "AWS (EC2, S3, IAM, ECS, Step Functions, CloudWatch)",
      "Docker",
      "CI/CD",
      "GitHub Actions",
      "Turborepo",
    ],
  },
  {
    label: "AI & LLM",
    items: ["OpenAI API", "RAG", "LLM Integration", "Vector Databases", "AI-assisted development"],
  },
  {
    label: "AI Training",
    items: ["LLM Evaluation", "Adversarial Prompt Design", "Red-Teaming", "Failure Analysis", "Golden Trajectories"],
  },
  { label: "Other", items: ["Web3 / Ethereum", "Smart Contracts", "System Design", "LLD", "DSA"] },
];

export const experience: Role[] = [
  {
    company: "Amazon",
    title: "Software Development Engineer",
    period: "Jul 2026 – Present",
    location: "New Delhi, India",
    points: [
      "Building a DynamoDB-compatible distributed database service in Golang for internal teams, evaluating ScyllaDB’s shared-nothing C++ architecture as the storage design reference.",
      "Developing a proxy-as-a-service cloud offering: a managed forward (egress) proxy routing customer outbound traffic through service-owned IPs, built on open-source proxy software.",
    ],
  },
  {
    company: "AI Training & LLM Evaluation",
    title: "AI Trainer (Freelance)",
    period: "Jul 2026 – Present",
    location: "Remote",
    points: [
      "Authored adversarial, multi-hop evaluation prompts in the politics domain, each with exactly one verifiable answer requiring synthesis across 3+ independent sources.",
      "Red-teamed frontier LLMs with extended reasoning and web search, confirming incorrect final answers and documenting root causes of each model failure.",
      "Wrote golden trajectories (step-by-step search paths and verified sources) used as reference reasoning for model training, passing automated quality checks before submission.",
      "Completed agentic coding tasks with Claude Code on build-dependency and release-management repositories.",
    ],
  },
  {
    company: "Compro Technologies",
    title: "Software Development Engineer",
    period: "Aug 2024 – Jun 2026",
    location: "New Delhi, India",
    points: [
      "Integrated Confluent Apache Kafka into a large-scale LMS platform processing 5M+ events/day for 10k+ DAU; built producers/consumers handling 100K+ events/hour, cutting end-to-end latency by 35%.",
      "Developed and deployed RESTful APIs using AI-assisted development workflows, reducing implementation time by ~60% and improving assignment creation efficiency by 20%.",
      "Designed a RAG-based document intelligence tool (OpenAI LLM + ChromaDB) supporting 200 QPS and improving search accuracy across the CUP platform.",
      "Designed an S3-backed microservice with DynamoDB GSI optimization, cutting query latency from 600ms to 150ms (75% improvement).",
      "Established CI/CD pipelines using Docker, GitHub Actions, and AWS ECS; reduced hotfix deployment time by 75%.",
    ],
  },
  {
    company: "Portalify",
    title: "Full Stack Developer Intern",
    period: "Dec 2023 – Jun 2024",
    location: "Remote",
    points: [
      "Delivered production drag-and-drop form and email template builders (React, TypeScript, Tailwind), enabling non-technical users to create templates 3× faster.",
      "Spearheaded development of a shared component library, increasing component reuse by 40%.",
    ],
  },
  {
    company: "Manav Rachna University (MRU)",
    title: "Software Developer Intern",
    period: "Jul 2023 – Nov 2023",
    location: "Faridabad, India",
    points: [
      "Architected a blockchain-based document management system (Solidity, Ethereum) with immutable storage and role-based access, securing 5,000+ records with verifiable audit trails.",
    ],
  },
];

export const resumeProjects = [
  {
    name: "Triponest – Enterprise Travel & Flight Concierge Platform",
    stack: "Next.js, Turborepo, React, Tailwind",
    point:
      "Architected a Turborepo monorepo with independently deployable micro-frontends and shared packages, enforcing strictly typed API contracts.",
  },
  {
    name: "Investment Tracker Platform",
    stack: "Next.js, Golang, Binance APIs, Chart.js",
    point:
      "Engineered a real-time crypto portfolio tracker with live Binance ingestion, sub-second UI updates, and Golang services for rate limiting, order syncing, and P&L reconciliation.",
  },
];

export const achievements = [
  "Solved 800+ LeetCode problems (contest rating 1648, top 17%).",
  "National-level athlete.",
];

export const education = {
  school: "Indraprastha Engineering College",
  degree: "Bachelor of Technology, Computer Science (GPA: 8.0)",
  period: "Dec 2020 – Jun 2024",
  location: "New Delhi, India",
};

// Headline numbers for the home page, all taken from the roles above.
export const highlights = [
  { value: "5M+", label: "Kafka events / day on an LMS serving 10k+ DAU" },
  { value: "600→150ms", label: "query latency after DynamoDB GSI redesign" },
  { value: "200 QPS", label: "RAG document intelligence (OpenAI + ChromaDB)" },
  { value: "800+", label: "LeetCode problems · top 17% contest rating" },
];
