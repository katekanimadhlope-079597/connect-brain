import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, NotebookPen, Search, Clock, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Your AI productivity dashboard: emails, meeting summaries and research reports.",
      },
      { property: "og:title", content: "Dashboard — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Track generated emails, summarized meetings and research reports in one place.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    text: "Generate professional workplace emails.",
    cta: "Create Email",
  },
  {
    to: "/meetings",
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    text: "Convert meeting notes into summaries and action items.",
    cta: "Summarize Meeting",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    text: "Research topics and generate structured insights.",
    cta: "Start Research",
  },
] as const;

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [emails, meetings, research] = await Promise.all([
        supabase
          .from("emails")
          .select("id,subject,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("meetings")
          .select("id,title,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("research")
          .select("id,question,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      const activity = [
        ...(emails.data ?? []).map((e) => ({
          id: e.id,
          type: "Email",
          title: e.subject || "Untitled email",
          created_at: e.created_at,
        })),
        ...(meetings.data ?? []).map((m) => ({
          id: m.id,
          type: "Meeting",
          title: m.title || "Untitled meeting",
          created_at: m.created_at,
        })),
        ...(research.data ?? []).map((r) => ({
          id: r.id,
          type: "Research",
          title: r.question || "Untitled research",
          created_at: r.created_at,
        })),
      ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

      return {
        emails: emails.data?.length ?? 0,
        meetings: meetings.data?.length ?? 0,
        research: research.data?.length ?? 0,
        activity: activity.slice(0, 8),
      };
    },
  });

  const emailCount = data?.emails ?? 0;
  const meetingCount = data?.meetings ?? 0;
  const researchCount = data?.research ?? 0;
  const minutesSaved = emailCount * 12 + meetingCount * 25 + researchCount * 40;

  const stats = [
    { label: "Emails Generated", value: emailCount },
    { label: "Meetings Summarized", value: meetingCount },
    { label: "Research Reports", value: researchCount },
    {
      label: "Time Saved",
      value: minutesSaved >= 60 ? `${(minutesSaved / 60).toFixed(1)} h` : `${minutesSaved} min`,
    },
  ];

  const firstName = (profile?.full_name || user?.email || "there").split(" ")[0];

  return (
    <AppShell
      title={`Welcome back, ${firstName}`}
      description="What would you like to accomplish today?"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {QUICK.map(({ to, icon: Icon, title, text, cta }) => (
          <article key={to} className="surface-panel flex flex-col p-6">
            <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-1 mb-5 grow text-sm text-muted-foreground">{text}</p>
            <Button asChild>
              <Link to={to}>{cta}</Link>
            </Button>
          </article>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Productivity statistics
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="surface-panel p-5">
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Recent activity
        </h2>
        <div className="surface-panel mt-3 divide-y divide-border">
          {(data?.activity ?? []).map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-5 py-3">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {item.type}
              </span>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Clock className="size-3" />
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {data && data.activity.length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Nothing here yet — generate your first email, meeting summary or research report.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
