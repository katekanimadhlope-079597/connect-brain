import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Mail, Save, Send, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ThinkingState } from "@/components/ThinkingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { researchTopic, askResearchFollowUp } from "@/lib/ai.functions";
import {
  DEPTHS,
  FORMATS,
  researchReportToText,
  type ResearchReport,
} from "@/lib/ai-types";
import { setEmailHandoff, takeResearchHandoff } from "@/lib/handoff";
import { copyText, downloadText } from "@/lib/export";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace" },
      {
        name: "description",
        content:
          "Research workplace topics and generate findings, benefits, risks and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — AI Workplace" },
      {
        property: "og:description",
        content: "Structured research reports with follow-up questions and email hand-off.",
      },
    ],
  }),
  component: ResearchPage,
});

type ChatMsg = { role: "user" | "assistant"; content: string };

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-5">
      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ResearchPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [depth, setDepth] = useState("Standard");
  const [format, setFormat] = useState("Research Brief");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [followUp, setFollowUp] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);

  const runResearch = useServerFn(researchTopic);
  const askFollowUp = useServerFn(askResearchFollowUp);

  useEffect(() => {
    if (profile) setDepth((d) => (d === "Standard" ? profile.default_depth : d));
  }, [profile]);

  useEffect(() => {
    const handoff = takeResearchHandoff();
    if (handoff) {
      setQuestion(handoff.question ?? "");
      setContext(handoff.context ?? "");
      toast.info("Question imported from your meeting.");
    }
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const researchMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      return await runResearch({ data: { question, depth, format, context } });
    },
    onSuccess: (r) => {
      setReport(r);
      setMessages([]);
    },
    onError: (e: Error) =>
      setError(e.message || "We couldn't complete the research request. Please try again."),
  });

  const followUpMutation = useMutation({
    mutationFn: async (q: string) => {
      if (!report) throw new Error("Run a research query first.");
      return await askFollowUp({
        data: {
          report: researchReportToText(question, report),
          history: messages,
          question: q,
        },
      });
    },
    onSuccess: (r, q) =>
      setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: r.answer }]),
    onError: (e: Error) => toast.error(e.message || "We couldn't answer that follow-up."),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!report || !user) throw new Error("Nothing to save.");
      const { error: dbError } = await supabase.from("research").insert({
        user_id: user.id,
        question,
        depth,
        format,
        summary: report.summary,
        findings: report.findings ?? [],
        analysis: report.analysis,
        benefits: report.benefits ?? [],
        risks: report.risks ?? [],
        recommendations: report.recommendations ?? [],
        sources: report.sources ?? [],
        messages,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Research saved to your workspace.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Couldn't save this research. Please try again."),
  });

  const asText = report ? researchReportToText(question, report) : "";

  return (
    <AppShell
      title="AI Research Assistant"
      description="Research workplace topics and turn them into structured insights"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          className="surface-panel space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            researchMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="question">What would you like to research?</Label>
            <Textarea
              id="question"
              rows={3}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the benefits of remote work?"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "What are the benefits of remote work?",
              "Compare agile and waterfall project management.",
              "What are current AI trends in business?",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuestion(q)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rcontext">Extra context (optional)</Label>
            <Textarea
              id="rcontext"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Research depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPTHS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Output format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={researchMutation.isPending || question.trim().length < 3}
          >
            <Wand2 className="mr-2 size-4" /> Start research
          </Button>
        </form>

        <div className="space-y-4">
          {researchMutation.isPending && (
            <ThinkingState
              steps={[
                "AI is researching your topic...",
                "Analyzing information...",
                "Preparing findings...",
                "Creating your report...",
              ]}
            />
          )}

          {error && !researchMutation.isPending && (
            <div className="surface-panel border-destructive/40 p-5 text-sm">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          )}

          {report && !researchMutation.isPending && (
            <>
              <div className="surface-panel p-6">
                <h2 className="text-base font-semibold">Research summary</h2>
                <Textarea
                  className="mt-2"
                  rows={4}
                  value={report.summary}
                  onChange={(e) => setReport({ ...report, summary: e.target.value })}
                />
                <List title="Key findings" items={report.findings ?? []} />
                <section className="mt-5">
                  <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Detailed analysis
                  </h3>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{report.analysis}</p>
                </section>
                <List title="Benefits" items={report.benefits ?? []} />
                <List title="Risks" items={report.risks ?? []} />
                <List title="Recommendations" items={report.recommendations ?? []} />
                <section className="mt-5">
                  <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Sources
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {(report.sources ?? []).map((s, i) => (
                      <li key={i}>
                        {s.title}
                        {s.note ? ` — ${s.note}` : ""}
                      </li>
                    ))}
                    {!report.sources?.length && (
                      <li>No live sources retrieved — treat findings as general guidance.</li>
                    )}
                  </ul>
                </section>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEmailHandoff({
                        purpose: `Share the key findings and recommendations from research on: ${question}`,
                        context: asText,
                        callToAction: "Let me know which recommendation you'd like to pursue.",
                      });
                      navigate({ to: "/email" });
                    }}
                  >
                    <Mail className="mr-2 size-4" /> Create email from research
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="mr-2 size-4" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(asText, "Report copied")}
                  >
                    <Copy className="mr-2 size-4" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadText(`${question.slice(0, 40) || "research"}.txt`, asText)}
                  >
                    <Download className="mr-2 size-4" /> Export
                  </Button>
                </div>
              </div>

              <div className="surface-panel p-6">
                <h2 className="text-base font-semibold">Follow-up assistant</h2>
                <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[85%] rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                          : "max-w-[90%] rounded-xl bg-secondary px-4 py-2 text-sm whitespace-pre-wrap text-secondary-foreground"
                      }
                    >
                      {m.content}
                    </div>
                  ))}
                  {followUpMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Thinking...
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = followUp.trim();
                    if (!q) return;
                    setFollowUp("");
                    followUpMutation.mutate(q);
                  }}
                >
                  <Input
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Ask a follow-up question..."
                  />
                  <Button type="submit" disabled={followUpMutation.isPending}>
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </>
          )}

          {!report && !researchMutation.isPending && !error && (
            <div className="surface-panel p-10 text-center text-sm text-muted-foreground">
              Your research report — findings, analysis, benefits, risks and recommendations — will
              appear here.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
