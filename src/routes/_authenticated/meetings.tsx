import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Mail, Save, Search, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ThinkingState } from "@/components/ThinkingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";
import { meetingAnalysisToText, type MeetingAnalysis } from "@/lib/ai-types";
import { extractTextFromFile } from "@/lib/parse-file";
import { setEmailHandoff, setResearchHandoff } from "@/lib/handoff";
import { copyText, downloadText } from "@/lib/export";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace" },
      {
        name: "description",
        content:
          "Turn meeting notes and transcripts into summaries, decisions, action items and next steps.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — AI Workplace" },
      {
        property: "og:description",
        content: "Extract decisions, owners, deadlines and open questions from any meeting.",
      },
    ],
  }),
  component: MeetingsPage,
});

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

function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summarize = useServerFn(summarizeMeeting);

  const runMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      return await summarize({ data: { title, date, participants, transcript: notes } });
    },
    onSuccess: (r) => setResult(r),
    onError: (e: Error) =>
      setError(
        e.message || "We couldn't analyse these meeting notes. Please check the document and try again.",
      ),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result || !user) throw new Error("Nothing to save.");
      const { error: dbError } = await supabase.from("meetings").insert({
        user_id: user.id,
        title: title || "Untitled meeting",
        meeting_date: date || null,
        participants,
        transcript: notes,
        summary: result.summary,
        key_points: result.keyPoints ?? [],
        decisions: result.decisions ?? [],
        action_items: result.actionItems ?? [],
        open_questions: result.openQuestions ?? [],
        next_steps: result.nextSteps ?? [],
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Meeting saved to your workspace.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Couldn't save this meeting. Please try again."),
  });

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      toast.info("Reading document...");
      const text = await extractTextFromFile(file);
      if (!text.trim()) throw new Error("No readable text found in that file.");
      setNotes(text);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast.success("Document loaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  };

  const asText = result ? meetingAnalysisToText(title || "Untitled meeting", result) : "";

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Paste notes or upload a TXT, PDF or DOCX file"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          className="surface-panel space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            runMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Meeting title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Names, comma separated"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes / transcript</Label>
            <Textarea
              id="notes"
              rows={12}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your notes or transcript here."
            />
          </div>
          <div className="flex items-center gap-3">
            <Label
              htmlFor="upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary"
            >
              <Upload className="size-4" /> Upload TXT / PDF / DOCX
            </Label>
            <input
              id="upload"
              type="file"
              className="sr-only"
              accept=".txt,.md,.pdf,.docx"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={runMutation.isPending || notes.trim().length < 20}
          >
            <Wand2 className="mr-2 size-4" /> Summarize meeting
          </Button>
        </form>

        <div className="space-y-4">
          {runMutation.isPending && (
            <ThinkingState
              steps={[
                "AI is analyzing your meeting...",
                "Extracting decisions...",
                "Finding action items...",
                "Preparing summary...",
              ]}
            />
          )}

          {error && !runMutation.isPending && (
            <div className="surface-panel border-destructive/40 p-5 text-sm">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          )}

          {result && !runMutation.isPending && (
            <div className="surface-panel p-6">
              <h2 className="text-base font-semibold">Executive summary</h2>
              <Textarea
                className="mt-2"
                rows={5}
                value={result.summary}
                onChange={(e) => setResult({ ...result, summary: e.target.value })}
              />

              <List title="Key discussion points" items={result.keyPoints ?? []} />
              <List title="Decisions" items={result.decisions ?? []} />

              {!!result.actionItems?.length && (
                <section className="mt-5">
                  <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Action items
                  </h3>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-muted-foreground uppercase">
                        <tr>
                          <th className="py-2 pr-3">Task</th>
                          <th className="py-2 pr-3">Owner</th>
                          <th className="py-2 pr-3">Deadline</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.actionItems.map((a, i) => (
                          <tr key={i} className="border-t border-border align-top">
                            <td className="py-2 pr-3">{a.task}</td>
                            <td className="py-2 pr-3">{a.owner || "—"}</td>
                            <td className="py-2 pr-3">{a.deadline || "—"}</td>
                            <td className="py-2">{a.status || "Not started"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {!!result.openQuestions?.length && (
                <section className="mt-5">
                  <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Open questions
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {result.openQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <span>{q}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setResearchHandoff({
                              question: q,
                              context: `Raised as an open question in the meeting "${title || "Untitled meeting"}".`,
                            });
                            navigate({ to: "/research" });
                          }}
                        >
                          <Search className="mr-2 size-3.5" /> Research this
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <List title="Next steps" items={result.nextSteps ?? []} />

              <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setEmailHandoff({
                      purpose: `Send a follow-up email after the meeting "${title || "our meeting"}" covering the summary, decisions, action items and next steps.`,
                      context: asText,
                      recipient: participants,
                      callToAction: "Confirm your action items and deadlines.",
                    });
                    navigate({ to: "/email" });
                  }}
                >
                  <Mail className="mr-2 size-4" /> Create follow-up email
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  <Save className="mr-2 size-4" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyText(asText, "Summary copied")}>
                  <Copy className="mr-2 size-4" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(`${title || "meeting"}.txt`, asText)}
                >
                  <Download className="mr-2 size-4" /> Export
                </Button>
              </div>
            </div>
          )}

          {!result && !runMutation.isPending && !error && (
            <div className="surface-panel p-10 text-center text-sm text-muted-foreground">
              Your summary, decisions, action items and open questions will appear here.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
