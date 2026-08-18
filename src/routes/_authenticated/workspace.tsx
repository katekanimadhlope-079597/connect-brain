import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Download, FileText, Mail, NotebookPen, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { copyText, downloadText } from "@/lib/export";
import {
  meetingAnalysisToText,
  researchReportToText,
  type MeetingAnalysis,
  type ResearchReport,
} from "@/lib/ai-types";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Every saved email, meeting summary and research report in one shared workspace.",
      },
      { property: "og:title", content: "Workspace — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Search, open, edit, export and delete your saved AI documents.",
      },
    ],
  }),
  component: WorkspacePage,
});

type Doc = {
  id: string;
  table: "emails" | "meetings" | "research";
  type: "Email" | "Meeting" | "Research";
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 10;

function WorkspacePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data: docs, isLoading } = useQuery({
    queryKey: ["workspace", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Doc[]> => {
      const [emails, meetings, research] = await Promise.all([
        supabase.from("emails").select("*").order("created_at", { ascending: false }),
        supabase.from("meetings").select("*").order("created_at", { ascending: false }),
        supabase.from("research").select("*").order("created_at", { ascending: false }),
      ]);
      const list: Doc[] = [
        ...(emails.data ?? []).map((e) => ({
          id: e.id,
          table: "emails" as const,
          type: "Email" as const,
          title: e.subject || "Untitled email",
          content: e.body,
          created_at: e.created_at,
          updated_at: e.updated_at,
        })),
        ...(meetings.data ?? []).map((m) => ({
          id: m.id,
          table: "meetings" as const,
          type: "Meeting" as const,
          title: m.title || "Untitled meeting",
          content: meetingAnalysisToText(m.title || "Untitled meeting", {
            summary: m.summary,
            keyPoints: (m.key_points ?? []) as string[],
            decisions: (m.decisions ?? []) as string[],
            actionItems: (m.action_items ?? []) as MeetingAnalysis["actionItems"],
            openQuestions: (m.open_questions ?? []) as string[],
            nextSteps: (m.next_steps ?? []) as string[],
          }),
          created_at: m.created_at,
          updated_at: m.updated_at,
        })),
        ...(research.data ?? []).map((r) => ({
          id: r.id,
          table: "research" as const,
          type: "Research" as const,
          title: r.question || "Untitled research",
          content: researchReportToText(r.question, {
            summary: r.summary,
            findings: (r.findings ?? []) as string[],
            analysis: r.analysis,
            benefits: (r.benefits ?? []) as string[],
            risks: (r.risks ?? []) as string[],
            recommendations: (r.recommendations ?? []) as string[],
            sources: (r.sources ?? []) as ResearchReport["sources"],
          }),
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
      ];
      return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (docs ?? []).filter((d) => {
      const matchesTab = tab === "all" || d.type.toLowerCase() === tab;
      const matchesSearch =
        !q || d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [docs, tab, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("No document selected.");
      const { id, table } = selected;
      if (table === "emails") {
        const { error } = await supabase
          .from("emails")
          .update({ subject: editTitle, body: editContent })
          .eq("id", id);
        if (error) throw error;
      } else if (table === "meetings") {
        const { error } = await supabase
          .from("meetings")
          .update({ title: editTitle, summary: editContent })
          .eq("id", id);
        if (error) throw error;
      } else if (table === "research") {
        const { error } = await supabase
          .from("research")
          .update({ question: editTitle, summary: editContent })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Document updated.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Couldn't save your changes. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: Doc) => {
      const { error } = await supabase.from(doc.table).delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document deleted.");
      setSelected(null);
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Couldn't delete that document."),
  });

  const icon = (type: Doc["type"]) =>
    type === "Email" ? Mail : type === "Meeting" ? NotebookPen : Search;

  return (
    <AppShell title="Workspace" description="Every saved email, meeting and research report">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="surface-panel p-5">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setPage(0);
            }}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="email">Emails</TabsTrigger>
              <TabsTrigger value="meeting">Meetings</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
            </TabsList>
          </Tabs>

          <Input
            className="mt-4"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />

          <ul className="mt-4 divide-y divide-border">
            {isLoading && <li className="py-6 text-sm text-muted-foreground">Loading...</li>}
            {!isLoading && pageItems.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">No documents found.</li>
            )}
            {pageItems.map((doc) => {
              const Icon = icon(doc.type);
              return (
                <li key={`${doc.table}-${doc.id}`}>
                  <button
                    className="flex w-full items-start gap-3 py-3 text-left hover:opacity-80"
                    onClick={() => {
                      setSelected(doc);
                      setEditTitle(doc.title);
                      setEditContent(doc.content);
                    }}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{doc.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {doc.type} · created {new Date(doc.created_at).toLocaleDateString()} ·
                        modified {new Date(doc.updated_at).toLocaleDateString()}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {page + 1} of {pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <div className="surface-panel p-6">
          {!selected && (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <FileText className="mb-3 size-6" />
              Select a document to open, edit, copy or export it.
            </div>
          )}

          {selected && (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {selected.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  Owner: you · Created {new Date(selected.created_at).toLocaleString()}
                </span>
              </div>
              <Input
                className="mt-4 font-medium"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <Textarea
                className="mt-3"
                rows={20}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  <Save className="mr-2 size-4" /> Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyText(`${editTitle}\n\n${editContent}`, "Document copied")}
                >
                  <Copy className="mr-2 size-4" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(`${editTitle}.txt`, `${editTitle}\n\n${editContent}`)}
                >
                  <Download className="mr-2 size-4" /> Export
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-auto"
                  onClick={() => deleteMutation.mutate(selected)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 size-4" /> Delete
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Saving updates the title and the summary/body of this document.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
