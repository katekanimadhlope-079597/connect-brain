import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, RefreshCw, Save, Wand2 } from "lucide-react";
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
import { generateEmail, transformEmail } from "@/lib/ai.functions";
import { TONES, LENGTHS, type EmailDraft } from "@/lib/ai-types";
import { takeEmailHandoff } from "@/lib/handoff";
import { copyText, downloadText } from "@/lib/export";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace" },
      {
        name: "description",
        content: "Generate, rewrite and retone professional workplace emails with AI.",
      },
      { property: "og:title", content: "Smart Email Generator — AI Workplace" },
      {
        property: "og:description",
        content: "Turn a purpose and some context into a polished workplace email in seconds.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [cta, setCta] = useState("");
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useServerFn(generateEmail);
  const transform = useServerFn(transformEmail);

  useEffect(() => {
    if (profile) {
      setTone((t) => (t === "Professional" ? profile.default_tone : t));
      setLength((l) => (l === "Medium" ? profile.default_length : l));
    }
  }, [profile]);

  useEffect(() => {
    const handoff = takeEmailHandoff();
    if (handoff) {
      setPurpose(handoff.purpose ?? "");
      setContext(handoff.context ?? "");
      setRecipient(handoff.recipient ?? "");
      setCta(handoff.callToAction ?? "");
      if (handoff.tone) setTone(handoff.tone);
      toast.info("Context imported. Review and generate your email.");
    }
  }, []);

  const genMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      return await generate({
        data: {
          purpose,
          recipient,
          context,
          tone,
          length,
          callToAction: cta,
          senderName: profile?.full_name ?? "",
        },
      });
    },
    onSuccess: (result) => setDraft(result),
    onError: (e: Error) =>
      setError(e.message || "Unable to generate your email. Please check your input and try again."),
  });

  const refineMutation = useMutation({
    mutationFn: async (instruction: string) => {
      setError(null);
      if (!draft) throw new Error("Generate an email first.");
      return await transform({
        data: {
          subject: draft.subject,
          body: draft.body,
          instruction,
          senderName: profile?.full_name ?? "",
        },
      });
    },
    onSuccess: (result) => setDraft(result),
    onError: (e: Error) => setError(e.message || "Unable to update your email. Please try again."),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft || !user) throw new Error("Nothing to save.");
      const { error: dbError } = await supabase.from("emails").insert({
        user_id: user.id,
        subject: draft.subject,
        body: draft.body,
        tone,
        length,
        purpose,
        recipient,
        context,
        call_to_action: cta,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Email saved to your workspace.");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Couldn't save this email. Please try again."),
  });

  const busy = genMutation.isPending || refineMutation.isPending;
  const fullText = draft ? `Subject: ${draft.subject}\n\n${draft.body}` : "";

  return (
    <AppShell
      title="Smart Email Generator"
      description="Describe the email you need — the assistant writes it"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          className="surface-panel space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            genMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="purpose">Email purpose</Label>
            <Textarea
              id="purpose"
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Explain the purpose of the email."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient (optional)</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Product team, Sarah at Acme"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              rows={5}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide background information."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta">Call to action (optional)</Label>
            <Input
              id="cta"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. Confirm attendance by Friday"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy || !purpose.trim()}>
            <Wand2 className="mr-2 size-4" /> Generate email
          </Button>
        </form>

        <div className="space-y-4">
          {busy && (
            <ThinkingState
              steps={[
                "AI is writing your email...",
                "Shaping tone and structure...",
                "Polishing the final draft...",
              ]}
            />
          )}

          {error && !busy && (
            <div className="surface-panel border-destructive/40 p-5 text-sm">
              <p className="font-medium text-destructive">{error}</p>
              <p className="mt-1 text-muted-foreground">
                Please check your input and try again.
              </p>
            </div>
          )}

          {draft && !busy && (
            <div className="surface-panel p-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                />
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="body">Email body</Label>
                <Textarea
                  id="body"
                  rows={18}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => copyText(fullText, "Email copied")}>
                  <Copy className="mr-2 size-4" /> Copy
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
                  variant="secondary"
                  onClick={() => downloadText(`${draft.subject || "email"}.txt`, fullText)}
                >
                  <Download className="mr-2 size-4" /> Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => genMutation.mutate()}>
                  <RefreshCw className="mr-2 size-4" /> Regenerate
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {[
                  { label: "Improve", instruction: "Improve clarity, flow and professionalism." },
                  { label: "Shorten", instruction: "Make it noticeably shorter and tighter." },
                  { label: "Expand", instruction: "Expand with more helpful detail and structure." },
                ].map((a) => (
                  <Button
                    key={a.label}
                    size="sm"
                    variant="ghost"
                    onClick={() => refineMutation.mutate(a.instruction)}
                  >
                    {a.label}
                  </Button>
                ))}
                <Select
                  onValueChange={(v) => {
                    setTone(v);
                    refineMutation.mutate(`Rewrite the email in a ${v.toLowerCase()} tone.`);
                  }}
                >
                  <SelectTrigger className="h-8 w-[170px]">
                    <SelectValue placeholder="Change tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate({ to: "/workspace" })}
                  className="ml-auto"
                >
                  Open workspace
                </Button>
              </div>
            </div>
          )}

          {!draft && !busy && !error && (
            <div className="surface-panel p-10 text-center text-sm text-muted-foreground">
              Your generated email will appear here, ready to edit, save and export.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
