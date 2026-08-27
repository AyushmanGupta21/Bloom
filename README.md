# 🌸 Bloom — AI Website Builder

<div align="center">
  
  <img src="public/logo.svg" alt="Bloom Logo" width="120" height="120" />
  
  <br />

  **From idea to website, instantly. Turn natural language into beautiful, production-ready web experiences.**

  [![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge)](https://bloom-ai-builder.vercel.app/)
  [![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM_AI_Engine-76B900?style=for-the-badge&logo=nvidia)](https://build.nvidia.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 🌟 About Bloom

**Bloom** is a next-generation AI-powered website builder designed to transform ideas, concepts, and natural language prompts into complete, responsive, production-ready websites in seconds.

Powered by a unified **NVIDIA NIM** high-throughput inference engine with dynamic model discovery, deterministic Bloom model branding, real-time code streaming, token bucket rate limiting, and comprehensive generation persistence.

---

## 🔮 NVIDIA NIM Architecture & Model Mapping

Bloom integrates with the official **NVIDIA NIM hosted API** (`https://integrate.api.nvidia.com/v1`) using server-side API keys and translates raw canonical model IDs into polished, deterministic Bloom model identities:

| Bloom Model Name | Canonical NVIDIA NIM Model | Badge | Capabilities | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Bloom Reason** *(Default)* | `nvidia/llama-3.1-nemotron-70b-instruct` | `◈ Deep` | Chat, Code, Reasoning, Flowbite | Fine-tuned Nemotron 70B for pristine UI precision |
| **Bloom Swift** | `meta/llama-3.3-70b-instruct` | `⚡ Fast` | Chat, Stream, Code, Fast Prototyping | Ultra-fast Llama 3.3 for high-velocity website creation |
| **Bloom Code** | `qwen/qwen2.5-coder-32b-instruct` | `⌘ Code` | HTML, CSS, JS, Tailwind, Flowbite | Specialized for clean syntax and component architecture |
| **Bloom Deep** | `deepseek-ai/deepseek-r1` | `🧠 Logic` | Deep Chain-of-Thought, Reasoning | High-reasoning architectural synthesis for complex apps |
| **Bloom Max** | `meta/llama-3.1-405b-instruct` | `✦ 405B Max` | Massive 128k context, Enterprise | Largest 405B model for extensive design systems |
| **Bloom Vision** | `meta/llama-3.2-90b-vision-instruct` | `◉ Vision` | Multimodal VLM, Screenshot to UI | Vision model for analyzing image references and layouts |
| **Bloom Studio** | `mistralai/mistral-large-2-instruct` | `🎨 Studio` | Creative Aesthetics, Varied Typography | Creative design specialist with distinct stylistic range |

---

## ✨ Key Capabilities

- 🌸 **Instant Generative Engine** — Describe your dream website in plain English and watch Bloom build a fully responsive page with modern aesthetics.
- ⚡ **NVIDIA NIM Inference** — Powered by NVIDIA-hosted inference microservices with dynamic catalog discovery from `GET /v1/models`.
- 🛡️ **Multi-Tier Rate Limiting & Resilience** — Token bucket rate limiting with jittered exponential backoff for `429 Too Many Requests` and automatic failover.
- 🎨 **Live Interactive Preview** — Real-time iframe sandbox rendering with element selection and style inspection.
- 💬 **Contextual AI Chat Modifications** — Refine sections, tweak layouts, inject components, or adjust color palettes through conversational AI prompts.
- 📜 **Generation History & Audit Logs** — Every generation is persisted in PostgreSQL with duration, token counts, and one-click prompt reuse.
- 🔮 **Optical Liquid Glass UI** — WebGL-powered Snell's law refraction shaders with dynamic optical lenses and glassmorphic depth.
- 📦 **Workspace & Project Management** — Persistent project dashboard powered by serverless PostgreSQL (Neon) and Drizzle ORM.
- 💾 **Production Source Export** — Download clean, standard HTML5 and Tailwind CSS bundles ready for local deployment.
- 🔐 **Enterprise Auth System** — Secure, dark-themed authentication flows powered by Clerk.

---

## 🛠️ Technology Stack

### Frontend & UI Architecture
- **Next.js 16.2.12** — Modern React framework with App Router & Turbopack
- **React 19.2.8** — Latest React primitives & Server Components
- **TypeScript 5** — Strict type safety across client and server boundaries
- **Tailwind CSS v4** — High-performance utility-first styling engine
- **Three.js & GLSL Shaders** — WebGL refraction and optical glass physics
- **Radix UI & Lucide Icons** — Accessible UI primitives and iconography
- **Sonner** — Toast notifications

### Backend, Database & AI
- **NVIDIA NIM API** — High-performance hosted microservice inference (`https://integrate.api.nvidia.com/v1`)
- **OpenRouter API** — Secondary / fallback LLM generative streaming engine
- **Neon Serverless PostgreSQL** — Scalable cloud SQL storage with Drizzle ORM
- **Clerk Authentication** — Identity management and protected workspace routing
- **ImageKit** — Media assets and optimization

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 20+ installed
- PostgreSQL database (e.g. Neon)
- Clerk account for authentication
- NVIDIA NIM API key (obtain from [build.nvidia.com](https://build.nvidia.com))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bloom.git
cd bloom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
# Neon PostgreSQL Connection
DATABASE_URL=your_neon_postgresql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# NVIDIA NIM AI Engine (Server-side only — never expose to client)
NVIDIA_API_KEY=your_nvidia_nim_api_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# OpenRouter AI Engine (Secondary / Fallback)
OPENROUTER_API_KEY=your_openrouter_api_key

# ImageKit Integration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 4. Push database schema
```bash
npm run db:push
```

### 5. Launch the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience Bloom.

---

## 📁 Repository Structure

```
bloom/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Clerk authentication routes (Sign In / Sign Up)
│   ├── _components/             # Landing & navigation components (VertexHero, VertexNavbar)
│   ├── api/                     # Serverless API routes
│   │   ├── ai/                  # AI subsystem (models, generations, health)
│   │   ├── ai-model/            # Generation streaming & logging endpoint
│   │   ├── chats/               # Conversation persistence
│   │   ├── frames/              # Frame & design code persistence
│   │   └── projects/            # Project lifecycle
│   ├── playground/              # Real-time generative canvas & AI chat editor
│   ├── workspace/               # User project dashboard & settings
│   ├── globals.css              # Global design system tokens & liquid glass physics
│   └── layout.tsx               # Root layout, metadata, Clerk & Model Provider
├── components/                   # Reusable UI & WebGL shader components
│   ├── ModelSelector.tsx        # Dynamic Bloom model selector dropdown
│   ├── ModelDetailsModal.tsx    # Model capability & specs inspection modal
│   └── LiquidGlassHero.tsx      # WebGL Snell refraction shader engine
├── config/                      # Database connection & Drizzle schema (generationsTable)
├── context/                     # Shared React state providers (ModelContext, UserDetail)
├── lib/
│   └── ai/                      # Multi-provider AI core
│       ├── types.ts             # Core provider & model interfaces
│       ├── registry.ts          # Unified model registry
│       ├── router.ts            # Central request dispatcher & failover
│       └── providers/
│           ├── nvidia/          # NVIDIA NIM client, discovery, naming & streaming
│           └── openrouter/      # Secondary OpenRouter provider adapter
└── public/                      # Static assets & Bloom vector identity system
```

---

## 🎯 How It Works

1. **Select Model** — Choose from `Bloom Reason`, `Bloom Swift`, `Bloom Code`, `Bloom Deep`, or `Bloom Max`.
2. **Prompt** — Enter your desired website specification into the Bloom Copilot.
3. **Synthesize** — Bloom streams structured HTML, Tailwind CSS, and Flowbite components via NVIDIA NIM.
4. **Inspect & Edit** — Select any element in the live iframe to tweak copy, colors, and layout, or use chat prompts for complex changes.
5. **Audit & History** — Inspect previous generations, token usage, and durations in the History drawer.
6. **Export** — Download clean, modular codebase bundles ready to deploy.

---

## 📝 License

This project is licensed under the MIT License.

---

<div align="center">
  
  **🌸 Bloom — From idea to website, instantly.**
  
</div>
