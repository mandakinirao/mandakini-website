# PROMPT 01 — Project Initialisation and Setup
> Paste this entire prompt into Claude Code to execute Block 1 of the build.
> Do not skip any step. Do not install packages not listed here.
> After completing all steps, update PROGRESS.md and PROMPT_LOG.md as instructed.

---

## CONTEXT

Read only these two files before starting. Do not read any other files.
- PROJECT.md
- PROGRESS.md

You are building the Mandakini Rao artist website. PROJECT.md contains the full architecture. PROGRESS.md contains the task list. You are executing BLOCK 1 of the task list.

---

## YOUR TASK

Initialise the Next.js 14 project and configure all foundational setup. You are not building any UI in this session. You are only setting up the project structure, installing dependencies, and creating configuration files.

---

## EXACT STEPS

### Step 1 — Initialise Next.js project
Run:
```
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```
When prompted, accept all defaults.

### Step 2 — Install dependencies
Run exactly this. Do not install anything else:
```
npm install @sanity/client @sanity/image-url next-sanity sanity gsap @stripe/stripe-js stripe resend react-email @react-email/components
```

### Step 3 — Create folder structure
Create the following empty folders (add a .gitkeep file in each so they commit):
```
components/layout/
components/intro/
components/works/
components/shop/
components/ui/
components/admin/
sanity/lib/
sanity/schemas/
lib/
styles/
public/placeholders/
emails/
```

### Step 4 — Create globals.css
Replace the contents of app/globals.css with exactly this:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-terracotta: #C2472F;
  --color-salmon: #E07E62;
  --color-peach: #EAA48A;
  --color-cream: #F4EDD6;
  --color-warm-white: #FAF6EE;
  --color-walnut: #2E1A0E;
  --color-gold: #C8A448;
  --color-sage: #7A8B6A;
  --color-yellow-muted: #D4A843;
  --color-near-black: #1A0D08;

  --bg-primary: var(--color-warm-white);
  --bg-section-warm: var(--color-cream);
  --bg-section-terracotta: var(--color-terracotta);
  --bg-intro: var(--color-near-black);
  --text-primary: var(--color-walnut);
  --text-on-dark: var(--color-cream);
  --accent-primary: var(--color-terracotta);
  --accent-secondary: var(--color-gold);
  --border-color: rgba(46, 26, 14, 0.15);

  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Jost', sans-serif;
  --font-accent: 'Cormorant SC', serif;

  --section-padding: 6rem;
  --container-max: 1320px;
}

html {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
}
```

### Step 5 — Update tailwind.config.js
Replace the content of tailwind.config.js with:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: 'var(--color-terracotta)',
        salmon: 'var(--color-salmon)',
        peach: 'var(--color-peach)',
        cream: 'var(--color-cream)',
        'warm-white': 'var(--color-warm-white)',
        walnut: 'var(--color-walnut)',
        gold: 'var(--color-gold)',
        sage: 'var(--color-sage)',
        'near-black': 'var(--color-near-black)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Jost', 'sans-serif'],
        accent: ['Cormorant SC', 'serif'],
      },
      maxWidth: {
        container: '1320px',
      },
    },
  },
  plugins: [],
}
```

### Step 6 — Create next.config.js
Replace the contents of next.config.js with:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig
```

### Step 7 — Create sanity.config.ts
Create file sanity.config.ts in the project root:
```ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'mandakini-rao',
  title: 'Mandakini Rao',
  projectId: 'i4t9kzxg',
  dataset: 'production',
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
```

### Step 8 — Create sanity/schemas/index.ts stub
Create file sanity/schemas/index.ts:
```ts
// Schema registry — all schemas will be imported and registered here
// Individual schema files will be added in Block 2
export const schemaTypes: any[] = []
```

### Step 9 — Create the Sanity Studio route
Create file app/studio/[[...tool]]/page.tsx:
```tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

### Step 10 — Create sanity/lib/client.ts stub
Create file sanity/lib/client.ts:
```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})
```

### Step 11 — Create all page route shells
Create the following files. Each file should export a minimal placeholder component that renders the page name so you can verify routing works.

- app/page.tsx — Home
- app/works/page.tsx — Works
- app/works/[slug]/page.tsx — Project detail
- app/shop/page.tsx — Shop
- app/shop/[slug]/page.tsx — Product detail
- app/about/page.tsx — About
- app/press/page.tsx — Press and Features
- app/contact/page.tsx — Contact
- app/admin/page.tsx — Admin

Example format for each:
```tsx
export default function WorksPage() {
  return <main><p>Works — coming soon</p></main>
}
```

### Step 12 — Create .env.local template
Create file .env.local.example (this is a template, not the actual env file):
```
NEXT_PUBLIC_SANITY_PROJECT_ID=i4t9kzxg
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

RESEND_API_KEY=

NEXT_PUBLIC_SITE_URL=https://mandakinirao.com
ADMIN_EMAIL=

ADMIN_PASSWORD=
```

### Step 13 — Add placeholder images
Download or create 9 solid-colour placeholder images at 400x500px (portrait ratio).
Save them as:
```
public/placeholders/portrait-1.jpg
public/placeholders/portrait-2.jpg
...
public/placeholders/portrait-9.jpg
```
Use any solid warm colour fill. These will be replaced with actual artwork later.

### Step 14 — Verify the project runs
Run:
```
npm run dev
```
Confirm:
- Site loads at localhost:3000
- /works, /shop, /about, /press, /contact, /admin all return their placeholder pages
- /studio loads the Sanity Studio (it may show an error about missing schemas — that is expected at this stage)

---

## RULES FOR THIS SESSION

- Do not build any UI beyond the placeholder page shells
- Do not write any Sanity schema content (that is Block 2)
- Do not install any package not listed in Step 2
- Do not modify any file not mentioned in the steps above
- If you encounter a TypeScript error in a stub file, add a comment // @ts-nocheck at the top as a temporary measure — do not spend time fixing type errors in stubs

---

## WHEN YOU ARE DONE

1. Update PROGRESS.md:
   - Mark tasks 1.1 through 1.10 as complete [x]
   - Note any tasks that had issues or were skipped and why
   - Write exactly what the next agent should do: "Start BLOCK 2 — Sanity Schema. Begin with task 2.1."
   - List every file you created or modified

2. Append to PROMPT_LOG.md:
   Write one paragraph summarising what was built, any non-obvious decisions made, and any issues encountered.

3. Do not do anything else after completing these two updates.
