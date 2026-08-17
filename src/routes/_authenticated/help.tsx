import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({
    meta: [
      { title: "Help — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "How to use the email generator, meeting summarizer and research assistant.",
      },
      { property: "og:title", content: "Help — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Guides for emails, meeting summaries, research and the shared workspace.",
      },
    ],
  }),
  component: HelpPage,
});

const SECTIONS = [
  {
    title: "Smart Email Generator",
    body: "Describe the purpose, add context, pick a tone and length, then generate. Use Improve, Shorten, Expand or Change Tone to refine, and Save to store it in your workspace.",
  },
  {
    title: "Meeting Notes Summarizer",
    body: "Paste notes or upload a TXT, PDF or DOCX file. The assistant returns a summary, discussion points, decisions, owned action items, open questions and next steps. Push results to an email or research an open question in one click.",
  },
  {
    title: "AI Research Assistant",
    body: "Ask a workplace question, choose depth and output format, then ask follow-up questions in the chat. The assistant never invents citations — sources list the general knowledge relied on.",
  },
  {
    title: "Workspace",
    body: "Every saved result lands in the workspace where you can search, open, edit, copy, export or delete it. Documents are private to your account.",
  },
];

function HelpPage() {
  return (
    <AppShell title="Help" description="Get the most out of your AI workspace">
      <div className="grid max-w-3xl gap-4">
        {SECTIONS.map((s) => (
          <article key={s.title} className="surface-panel p-6">
            <h2 className="text-base font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
