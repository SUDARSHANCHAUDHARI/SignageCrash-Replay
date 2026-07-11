# SignageCrash Replay

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

Crash investigation tool for digital signage teams. Upload screenshots, paste logs, and generate a timeline, root cause, customer explanation, and engineering notes.

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

## Author

Built by [Sudarshan Chaudhari](https://github.com/SUDARSHANCHAUDHARI) for **SudarshanTechLabs**.

## License

MIT
