<div align="center">

<img src="public/logo-main.png" alt="Bloom Logo" width="110" height="110" />

# Bloom — AI Website Builder

**From idea to website, instantly. Turn natural language into beautiful, production-ready web experiences.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-10b981?style=for-the-badge)](https://web-ly.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM_Engine-76b900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Overview

Bloom is an AI-powered website builder that turns a plain-English description into a complete, responsive, production-ready web page in seconds. Describe what you want, watch the code stream into a live preview, then refine it visually or through conversational prompts — and export clean HTML when you're done.

Generation runs entirely on **NVIDIA NIM** hosted inference. The engine streams HTML and Tailwind CSS in real time, so the preview starts rendering within about a second of hitting generate, and a full page completes in roughly twenty seconds.

## Key Features

- **Instant generation** — Describe a site in natural language and get a complete, responsive page with modern styling, working icons, and real imagery.
- **Real-time streaming preview** — Code streams token-by-token into a sandboxed iframe with a live, staged progress indicator (connect → generate → render).
- **Conversational editing** — Refine layouts, swap sections, adjust colors, or add components through follow-up chat prompts.
- **Direct element editing** — Click any element in the preview to edit copy, tweak styles, or replace images inline.
- **Multiple models** — Choose the engine that fits the task, from fast prototyping to high-quality synthesis.
- **Generation history** — Every generation is persisted with prompt, output, token counts, and duration for one-click reuse and auditing.
- **Project workspace** — Manage projects and frames from a persistent dashboard backed by serverless PostgreSQL.
- **Clean export** — Download standard HTML5 + Tailwind CSS ready to deploy anywhere.
- **Secure auth** — Authentication and protected workspace routing via Clerk.

## AI Models

Bloom talks to the official NVIDIA NIM hosted API (`https://integrate.api.nvidia.com/v1`) and maps canonical model IDs to friendly Bloom identities. NVIDIA NIM is the sole generation engine — there is no external provider fallback.

| Bloom Model | NVIDIA NIM Model | Best For |
| :--- | :--- | :--- |
| **Bloom Reason** *(default)* | `openai/gpt-oss-120b` | High-quality, complete websites with icons and imagery |
| **Bloom Swift** | `openai/gpt-oss-20b` | Fast prototyping and quick iterations |
| **Bloom Vision** | `meta/llama-3.2-90b-vision-instruct` | Analyzing mockups and complex layouts |

If a selected model becomes unavailable, Bloom automatically falls back to the fast default model — staying entirely within NVIDIA NIM.

## Tech Stack

**Frontend**
- Next.js 15.5 (App Router) with React 19.2
- TypeScript 5
- Tailwind CSS v4
- Three.js / GLSL shaders for the liquid-glass landing visuals
- Radix UI primitives, Lucide icons, Sonner toasts

**Backend & Data**
- NVIDIA NIM hosted inference API (streaming generation)
- Neon serverless PostgreSQL with Drizzle ORM
- Clerk for authentication
- ImageKit for media assets

## Getting Started

### Prerequisites
- Node.js 20 or newer
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A [Clerk](https://clerk.com) account for authentication
- An NVIDIA NIM API key from [build.nvidia.com](https://build.nvidia.com)

### 1. Clone and install
```bash
git clone https://github.com/AyushmanGupta21/Bloom.git
cd Bloom
npm install
```

### 2. Configure environment variables
Create a `.env` file in the project root:
```env
# Neon PostgreSQL
DATABASE_URL=your_neon_postgresql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# NVIDIA NIM (server-side only — never expose to the client)
NVIDIA_API_KEY=your_nvidia_nim_api_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# ImageKit (media)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 3. Push the database schema
```bash
npx drizzle-kit push
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

## How It Works

1. **Describe** — Enter a website description in the Bloom Copilot, or pick a quick preset.
2. **Generate** — Bloom streams HTML and Tailwind CSS from NVIDIA NIM directly into a live preview.
3. **Refine** — Click elements to edit them inline, or send follow-up prompts to change layout, copy, or styling.
4. **Review history** — Revisit past generations with their prompts, token usage, and durations.
5. **Export** — Download a clean, ready-to-deploy HTML + Tailwind bundle.

## Project Structure

```
Bloom/
├── app/
│   ├── (auth)/                  # Clerk sign-in / sign-up routes
│   ├── _components/             # Landing & navigation (VertexHero, VertexNavbar)
│   ├── api/
│   │   ├── ai/                  # Model catalog, generations, health endpoints
│   │   ├── ai-model/            # Streaming generation + logging endpoint
│   │   ├── chats/               # Conversation persistence
│   │   ├── frames/              # Frame & design-code persistence
│   │   └── projects/            # Project lifecycle
│   ├── playground/              # Live generative canvas & AI chat editor
│   ├── workspace/               # Project dashboard & settings
│   ├── globals.css              # Design tokens & liquid-glass styles
│   └── layout.tsx               # Root layout, metadata, providers
├── components/                  # Reusable UI & WebGL components
├── config/                      # Database connection & Drizzle schema
├── context/                     # Shared React providers
├── lib/
│   └── ai/                      # AI core
│       ├── registry.ts          # Model registry
│       ├── router.ts            # Request dispatcher
│       └── providers/nvidia/    # NVIDIA NIM client, discovery, streaming
└── public/                      # Static assets & Bloom logo
```

## License

Released under the MIT License.

---

<div align="center">

**Bloom — From idea to website, instantly.**

</div>
