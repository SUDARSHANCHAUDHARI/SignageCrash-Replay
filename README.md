# SignageCrash Replay

AI-powered crash replay tool for digital signage teams. Upload screenshots and paste device logs — the AI reconstructs the crash timeline, identifies the root cause, and generates a customer-ready explanation.

## What it does

- Accepts manual screenshot uploads (up to 5) and raw device logs
- Parses logs into a structured event timeline with severity detection
- Uses Claude or GPT-4o to identify root cause, affected system, and confidence level
- Generates plain-English customer explanations you can copy immediately
- Provides ordered resolution steps for your engineering team
- Exports full crash reports as Markdown

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env file and add your API key
cp .env.example .env.local
# Edit .env.local: set ANTHROPIC_API_KEY or OPENAI_API_KEY

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | No | `claude` (default) or `openai` |
| `ANTHROPIC_API_KEY` | If using Claude | Anthropic API key |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key |

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Package manager:** pnpm
- **AI:** Claude claude-sonnet-4-6 via `@anthropic-ai/sdk` or GPT-4o via `openai`
- **Storage:** In-memory (Phase 1 — resets on server restart)

## Phase Roadmap

- **Phase 1 (current):** Manual upload, in-memory storage, AI analysis
- **Phase 2:** Device agent SDK, persistent database
- **Phase 3:** Real-time streaming, team collaboration, alert rules

## License

MIT
