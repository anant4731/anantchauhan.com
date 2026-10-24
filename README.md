# anantchauhan.com

My public site: landing page, resume, projects and about. Next.js 16 (App Router, Cache Components), Tailwind v4 and a hand-written three.js particle scene. Every page is static.

## Develop

```bash
npm install
npm run dev
```

## Edit content

Everything visitors read lives in `src/content/`:

| File | Feeds |
| --- | --- |
| `site.ts` | Name, tagline, email, social links, nav |
| `resume.ts` | `/resume`, plus the impact numbers and timeline on the home page |
| `projects.ts` | `/projects` and each `/projects/<slug>` case study |

The About page copy is in `src/app/about/page.tsx`.

`/resume` prints as a one-page A4 (the **Save as PDF** button calls `window.print()`). The phone number is deliberately not on the public site.

## The particle scene

`src/components/scene/` holds the scene, loaded only in the browser and only on `/`:

- `shapes.ts` builds the five formations: the name, network globe, galaxy, torus knot and wave grid.
- `shaders.ts` blends between them on the GPU as you scroll, adding turbulence mid-transition, cursor repulsion and click shockwaves.
- `particle-field.ts` handles the renderer, bloom, input and the render loop.

Each `<section data-scene>` on the home page maps to one formation, in order. The scene runs 60k particles on desktop and 26k on phones and low-core devices. With `prefers-reduced-motion` it stays still. Without WebGL2, the page shows the name as plain text.

## Deploy

The site deploys to Vercel. DNS is at GoDaddy:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Leave the existing `portfolio` record alone: it points at the private investment portal on EC2.
