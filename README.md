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
- Anthropic SDK and OpenAI SDK
- File-backed JSON storage through a repository interface

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | No | `claude` by default, or `openai`. |
| `ANTHROPIC_API_KEY` | If using Claude | Anthropic API key. |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key. |
| `SIGNAGE_DATA_DIR` | Production | Persistent writable data directory. |
| `SIGNAGE_STORAGE_DRIVER` | No | `file` by default. Use `memory` only for demos. |

## Production Storage

Production uses file-backed JSON under `SIGNAGE_DATA_DIR`.

- Mount `SIGNAGE_DATA_DIR` as persistent writable storage.
- Keep `SIGNAGE_STORAGE_DRIVER=file` in production.
- Do not store generated reports or uploaded screenshots in git.

### Hosting Notes

File-backed storage is suitable for a VPS, Docker host, or platform with a persistent disk. For example:

```env
SIGNAGE_STORAGE_DRIVER=file
SIGNAGE_DATA_DIR=/data/signage-crash-replay
```

If you deploy on Vercel or another serverless host, do not rely on local file writes for saved crash reports. Serverless filesystems can reset between deployments or function instances. For that setup, use this release as the public app/code release and add a managed database adapter before depending on saved report history in production.

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
