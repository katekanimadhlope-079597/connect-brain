import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Mail,
  NotebookPen,
  Search,
  FolderOpen,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/meetings", label: "Meeting Notes", icon: NotebookPen },
  { to: "/research", label: "AI Research", icon: Search },
  { to: "/workspace", label: "Workspace", icon: FolderOpen },
] as const;

function useRecentDocs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recent-docs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [emails, meetings, research] = await Promise.all([
        supabase
          .from("emails")
          .select("id,subject,created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("meetings")
          .select("id,title,created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("research")
          .select("id,question,created_at")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);
      const items = [
        ...(emails.data ?? []).map((e) => ({
          id: e.id,
          title: e.subject || "Untitled email",
          created_at: e.created_at,
        })),
        ...(meetings.data ?? []).map((m) => ({
          id: m.id,
          title: m.title || "Untitled meeting",
          created_at: m.created_at,
        })),
        ...(research.data ?? []).map((r) => ({
          id: r.id,
          title: r.question || "Untitled research",
          created_at: r.created_at,
        })),
      ];
      return items
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 5);
    },
  });
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: recent } = useRecentDocs();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <span className="font-display text-sm leading-tight font-semibold">
          AI Workplace
          <br />
          Productivity Assistant
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 px-5">
        <p className="text-xs tracking-wide text-sidebar-foreground/50 uppercase">
          Recent documents
        </p>
        <ul className="mt-2 space-y-1">
          {(recent ?? []).map((doc) => (
            <li key={doc.id} className="truncate text-xs text-sidebar-foreground/70">
              {doc.title}
            </li>
          ))}
          {recent && recent.length === 0 && (
            <li className="text-xs text-sidebar-foreground/50">Nothing yet</li>
          )}
        </ul>
      </div>

      <div className="mt-auto space-y-1 px-3 pb-4">
        <Link
          to="/settings"
          onClick={() => setOpen(false)}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
        >
          <Settings className="size-4" /> Settings
        </Link>
        <Link
          to="/help"
          onClick={() => setOpen(false)}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
        >
          <LifeBuoy className="size-4" /> Help
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="size-4" /> Logout
        </button>
        <div className="mt-3 truncate border-t border-sidebar-border px-3 pt-3 text-xs text-sidebar-foreground/60">
          {profile?.full_name || "Signed in"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">{sidebar}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72">
            <button
              className="absolute top-4 right-3 z-10 text-sidebar-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            {description && (
              <p className="truncate text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </header>
        <main className={cn("px-4 py-6 md:px-8 md:py-8")}>{children}</main>
      </div>
    </div>
  );
}
