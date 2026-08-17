import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, Search, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Automate emails, summarize meetings and research workplace topics with one intelligent AI workspace.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "One connected AI workspace for professional emails, meeting summaries and research reports.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Mail,
    title: "Smart Email Generator",
    text: "Write better emails in seconds — set the purpose, tone and length and refine with one click.",
  },
  {
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    text: "Transform meetings into clear summaries, decisions and owned action items with deadlines.",
  },
  {
    icon: Search,
    title: "AI Research Assistant",
    text: "Research workplace topics and turn findings, benefits and risks into practical recommendations.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 font-display font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          AI Workplace
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-6 py-20 text-primary-foreground md:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs">
            <ShieldCheck className="size-3.5" /> Private to your account
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-semibold md:text-6xl">
            AI Workplace Productivity Assistant
          </h1>
          <p className="mt-5 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
            Automate emails, summarize meetings, and research workplace topics with one intelligent
            AI workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold md:text-3xl">Three assistants, one workspace</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="surface-panel p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Information moves between tools</h2>
            <p className="mt-4 text-muted-foreground">
              Summarize a meeting, push its decisions and action items straight into a follow-up
              email, and send unresolved questions to the research assistant. Every result is saved
              to a shared workspace you can edit, export and reuse.
            </p>
            <Button asChild className="mt-6">
              <Link to="/auth">
                Start free <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="surface-panel grid gap-3 p-6 text-sm">
            {["Email", "Meetings", "Research"].map((label, i) => (
              <div key={label}>
                <div className="rounded-lg border border-border bg-background px-4 py-3 font-medium">
                  {label}
                </div>
                {i < 2 && <div className="py-1 text-center text-muted-foreground">↕</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        AI Workplace Productivity Assistant — emails, meetings and research in one place.
      </footer>
    </div>
  );
}
