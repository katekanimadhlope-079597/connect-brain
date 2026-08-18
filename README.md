# AI Workplace Productivity Assistant

A modern, integrated AI workspace for professionals who want to automate everyday workplace tasks. Generate emails, summarize meetings, and research topics — all in one place, with data that flows between the three assistants.

## What it does

- **Smart Email Generator** — Write professional emails from a simple purpose, context, and tone. Then improve, shorten, expand, retone, copy, save, or export them.
- **Meeting Notes Summarizer** — Paste notes or upload a TXT / PDF / DOCX file and get an executive summary, key discussion points, decisions, action items, open questions, and next steps. Send results straight into an email or research an open question in one click.
- **AI Research Assistant** — Ask a workplace question, choose depth and format, and receive a structured report with findings, analysis, benefits, risks, and recommendations. Ask follow-up questions in a chat, then create an email from the findings.
- **Shared Workspace** — Every saved email, meeting, and research report appears in a single searchable, editable workspace with copy and export support.
- **Profile & Settings** — Set your default email tone, research depth, response length, and language preferences.

## Built with

- **TanStack Start** — full-stack React framework with file-based routing and server functions
- **React 19** + **TypeScript**
- **Tailwind CSS v4** — design system with semantic CSS tokens
- **Lovable Cloud** — managed authentication, PostgreSQL database, and AI gateway
- **Lovable AI Gateway** — server-side AI calls (Gemini models)

## Project structure

```
src/
  components/          # Shared UI components (AppShell, ThinkingState, etc.)
  components/ui/       # shadcn/ui primitives
  hooks/               # useAuth, useProfile
  integrations/        # Lovable Cloud / Supabase client (auto-generated)
  lib/                 # ai server layer, types, file parsing, export utilities
  routes/              # TanStack file-based routes
    __root.tsx         # Root layout and auth provider
    index.tsx          # Public landing page
    auth.tsx           # Login / register
    _authenticated/    # Protected routes (dashboard, email, meetings, research, workspace, settings)
  styles.css           # Design system: fonts, colors, tokens, utilities
```

## Getting started

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the dev server:
   ```bash
   bun run dev
   ```
   The app opens at `http://localhost:8080`.
4. Authentication and the database are handled by Lovable Cloud. Sign up or log in, then start generating emails, summaries, or research reports.

## Key features

- **Cross-tool handoff** — Meeting summaries and research findings flow into the email generator without copying and pasting. Open questions from meetings flow into the research assistant.
- **File uploads** — Drag-and-drop or select TXT, PDF, or DOCX files to extract text into the meeting summarizer.
- **Persistent workspace** — All results are saved to a user-scoped database with Row-Level Security (RLS), so users can only access their own documents.
- **Loading states** — Clear progress messaging and skeleton states while the AI works.
- **Error handling** — Friendly, actionable messages when AI or file processing fails.
- **Responsive design** — Works on desktop, tablet, and mobile with a collapsible sidebar.

## AI usage notes

- The AI uses the Lovable AI Gateway with `google/gemini-3.5-flash`.
- The AI does **not** invent facts, sources, deadlines, or owners. It only extracts action owners and deadlines when the source material explicitly supports them.
- Research reports include a source section with the general knowledge relied on, not fabricated citations.

## Database tables

- `profiles` — User profile and AI preferences
- `emails` — Generated emails
- `meetings` — Meeting summaries, decisions, action items, open questions, next steps
- `research` — Research questions, findings, analysis, and follow-up messages

Every table is scoped to the authenticated user via RLS policies and grants.

## Scripts

- `bun run dev` — Start the dev server
- `bun run build` — Build for production
- `bun run preview` — Preview the production build
- `bun run lint` — Run ESLint
- `bun run format` — Format code with Prettier

## License

This is your project. The code is owned by the creator and can be deployed anywhere Lovable Cloud allows.
