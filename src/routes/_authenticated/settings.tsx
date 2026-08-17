import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { TONES, LENGTHS, DEPTHS } from "@/lib/ai-types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — AI Workplace" },
      {
        name: "description",
        content: "Manage your profile details and default AI tone, depth, length and language.",
      },
      { property: "og:title", content: "Profile & Settings — AI Workplace" },
      {
        property: "og:description",
        content: "Set your default email tone, research depth and response length.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    full_name: "",
    job_title: "",
    company: "",
    avatar_url: "",
    default_tone: "Professional",
    default_depth: "Standard",
    default_length: "Medium",
    language: "English",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        job_title: profile.job_title,
        company: profile.company,
        avatar_url: profile.avatar_url ?? "",
        default_tone: profile.default_tone,
        default_depth: profile.default_depth,
        default_length: profile.default_length,
        language: profile.language,
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in.");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...form, avatar_url: form.avatar_url || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Couldn't save your settings. Please try again."),
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <AppShell title="Profile & Settings" description="Your details and AI preferences">
      <form
        className="grid max-w-4xl gap-6 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <section className="surface-panel space-y-4 p-6">
          <h2 className="text-base font-semibold">Profile</h2>
          <div className="space-y-2">
            <Label htmlFor="full_name">Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => set("full_name")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Job title</Label>
            <Input
              id="job_title"
              value={form.job_title}
              onChange={(e) => set("job_title")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => set("company")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Profile picture URL</Label>
            <Input
              id="avatar_url"
              value={form.avatar_url}
              onChange={(e) => set("avatar_url")(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </section>

        <section className="surface-panel space-y-4 p-6">
          <h2 className="text-base font-semibold">AI preferences</h2>
          <div className="space-y-2">
            <Label>Default email tone</Label>
            <Select value={form.default_tone} onValueChange={set("default_tone")}>
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
            <Label>Default research depth</Label>
            <Select value={form.default_depth} onValueChange={set("default_depth")}>
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
            <Label>Default response length</Label>
            <Select value={form.default_length} onValueChange={set("default_length")}>
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
          <div className="space-y-2">
            <Label htmlFor="language">Preferred language</Label>
            <Input
              id="language"
              value={form.language}
              onChange={(e) => set("language")(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="mr-2 size-4" /> Save settings
          </Button>
        </section>
      </form>
    </AppShell>
  );
}
