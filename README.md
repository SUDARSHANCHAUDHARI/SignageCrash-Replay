# SignageCrash Replay

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

Crash investigation tool for digital signage teams. Upload screenshots, paste logs, and generate a timeline, root cause, customer explanation, and engineering notes.

## Table of Contents

- [What It Does](#what-it-does)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Production Checks](#production-checks)
- [Release Notes](#release-notes)
- [License](#license)
- [About](#about)

## What It Does

SignageCrash Replay helps support and engineering teams reconstruct signage failures from screenshots and logs. It turns a messy crash report into an ordered diagnosis that can be shared with customers or used internally.

## Features

- Upload up to 5 screenshots per crash report.
- Paste raw player, device, or browser logs.
- Parse logs into a structured event timeline.
- Classify severity and affected system.
- Generate root cause, customer explanation, developer notes, and recommended steps.
- Store crash reports with file-backed durable storage.
- Export crash reports as Markdown.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Anthropic SDK and OpenAI SDK (called with the visitor's own key)
- Cloudflare KV storage through a repository interface

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No `.env` is required — see Configuration below.

## Configuration

**AI is bring-your-own-key.** There is no server-side API key. Each visitor adds
their own Anthropic or OpenAI key in the app's Settings; it is stored only in
their browser and sent per request (`x-api-key` header), so hosting the app
publicly can never bill your account. Without a key the analysis falls back to a
parsed-log summary.

**Storage:** crash reports persist in **Cloudflare KV** (binding `SIGNAGE_KV`).
For local development the repository interface also ships `file` and `memory`
drivers, selectable via `SIGNAGE_STORAGE_DRIVER`.

## Deployment

Deployed on **Cloudflare Pages** as a static export + Pages Functions:

- Build command `npx next build`, output directory `out`.
- Compatibility flag `nodejs_compat` (for the AI SDKs and `Buffer`).
- Bind a KV namespace as `SIGNAGE_KV`.
- Live at `signagecrashreplay.sudarshantechlabs.com`.

## Roadmap

| Phase | Status | Scope |
|---|---|---|
| Phase 1 | Ready | Manual upload, durable report storage, AI analysis. |
| Phase 2 | Planned | Device agent SDK and managed database adapter. |
| Phase 3 | Planned | Streaming, collaboration, and alert rules. |

## Production Checks

```bash
pnpm type-check
pnpm build
```

## Release Notes

- Keep AI provider keys in the deployment environment.
- Verify upload limits before increasing screenshot count or size.
- Verify the persistent storage volume before public release.

## License

MIT

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
