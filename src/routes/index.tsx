import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  Search,
  ListChecks,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Activity,
  TrendingUp,
  Flame,
  Lightbulb,
  LibraryBig,
  FolderKanban,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NovaAvatar } from "@/components/nova-avatar";
import { PageHeader } from "@/components/page-header";
import {
  useActivity,
  useHydrated,
  useProfile,
  useStats,
  useStreak,
} from "@/hooks/use-storage";
import { productivityScore, streakBadge, streakMessage, AI_TIPS } from "@/lib/storage";
import { TEMPLATES } from "@/lib/templates";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const quickActions = [
  { title: "Generate Email", to: "/email", icon: Mail, color: "from-blue-500 to-indigo-500" },
  { title: "Research Topic", to: "/research", icon: Search, color: "from-sky-500 to-blue-600" },
  { title: "Plan Tasks", to: "/tasks", icon: ListChecks, color: "from-indigo-500 to-purple-500" },
  { title: "Summarise Meeting", to: "/meetings", icon: FileText, color: "from-cyan-500 to-blue-500" },
  { title: "Chat with AI", to: "/chat", icon: MessageSquare, color: "from-blue-600 to-violet-500" },
];

const statConfig: { kind: keyof ReturnType<typeof useStats>; label: string; icon: typeof Mail }[] = [
  { kind: "email", label: "Emails Generated", icon: Mail },
  { kind: "meeting", label: "Meetings Summarised", icon: FileText },
  { kind: "research", label: "Research Sessions", icon: Search },
  { kind: "tasks", label: "Tasks Planned", icon: ListChecks },
  { kind: "chat", label: "AI Conversations", icon: MessageSquare },
];

const activityLabels: Record<string, string> = {
  email: "Email drafted",
  research: "Research completed",
  meeting: "Meeting summarised",
  tasks: "Task plan created",
  chat: "Chat with Nova",
};

function Dashboard() {
  const [profile] = useProfile();
  const stats = useStats();
  const activity = useActivity();
  const streak = useStreak();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [tipIx, setTipIx] = useState(0);
  const [popStreak, setPopStreak] = useState(false);
  useEffect(() => {
    if (hydrated) setTipIx(Math.floor(Math.random() * AI_TIPS.length));
  }, [hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    setPopStreak(true);
    const id = window.setTimeout(() => setPopStreak(false), 700);
    return () => window.clearTimeout(id);
  }, [streak.current, hydrated]);
  const score = productivityScore(stats);
  const badge = streakBadge(streak.current);
  const featured = TEMPLATES.slice(0, 4);

  const suggestions = [
    "Prioritise high-impact tasks each morning.",
    "Break large projects into smaller milestones.",
    "Schedule focused deep-work sessions.",
    "Review AI-generated content before sending.",
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={hydrated ? `Welcome back, ${profile.name} 👋` : "Welcome back 👋"}
        description="Your intelligent workplace productivity assistant. Let Nova help you write, plan, research, and chat."
      />

      <Card className="border-none p-0 shadow-[var(--shadow-soft)]">
        <div
          className="rounded-[var(--radius-lg)] p-6 sm:p-8"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4 text-primary-foreground">
              <NovaAvatar size={56} className="shrink-0 ring-4 ring-white/20" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                  <Sparkles className="h-4 w-4" /> Nova · AI Assistant
                </div>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                  Hello! I'm Nova, your AI workplace assistant.
                </h2>
                <p className="mt-1 max-w-xl text-sm opacity-90">
                  I'm here to help you write emails, organise your work, summarise meetings,
                  conduct research, and answer your questions.
                </p>
              </div>
            </div>
            <Link to="/chat">
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                Chat with Nova <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Productivity Streak
              </h3>
            </div>
            <Badge variant="secondary">Nova activity</Badge>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div
                className={`text-4xl font-bold text-foreground ${popStreak ? "animate-streak-pop" : ""}`}
              >
                🔥 {hydrated ? streak.current : 0}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  day{streak.current === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {hydrated ? streakMessage(streak.current) : "Loading…"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl">{badge.icon}</div>
              <div className="text-xs font-medium text-muted-foreground">{badge.label}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Best: {hydrated ? streak.best : 0} days</span>
            <span>·</span>
            <span>Milestones: 🥉 3 · 🥈 7 · 🥇 30 · 🏆 100</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                AI Tip of the Day
              </h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTipIx((i) => (i + 1) % AI_TIPS.length)}
            >
              Next tip
            </Button>
          </div>
          <div
            key={tipIx}
            className="animate-fade-in rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-foreground"
          >
            💡 {AI_TIPS[tipIx]}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Nova activity status
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <NovaAvatar size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Nova online · ready to help
              </div>
              <div className="text-xs text-muted-foreground">
                {hydrated && activity[0]
                  ? `Last action: ${activity[0].title}`
                  : "No recent activity yet."}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-md border border-border/60 bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Theme</div>
            <ThemeToggle />
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <LibraryBig className="mr-1 inline h-4 w-4" /> Quick prompt templates
          </h3>
          <Link to="/templates" className="text-xs font-medium text-primary hover:underline">
            Browse all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => (
            <Link
              key={t.id}
              to="/templates"
              className="group rounded-[var(--radius-lg)] border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="text-2xl">{t.icon}</div>
              <div className="mt-2 text-sm font-semibold text-foreground">{t.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {t.description}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Card className="p-2">
        <div className="flex items-center gap-2 px-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search WorkWise AI — try 'draft a follow-up email' or 'summarise notes'…"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </Card>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="group">
              <Card className="h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
                <div
                  className={`mb-3 grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${a.color} text-white shadow-md`}
                >
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-foreground">{a.title}</div>
                <div className="mt-1 flex items-center text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statConfig.map((s) => (
          <Card key={s.kind} className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <s.icon className="h-4 w-4 text-primary" />
              {s.label}
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {hydrated ? stats[s.kind] : 0}
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent AI activity</h3>
              <p className="text-sm text-muted-foreground">
                Your latest Nova-powered sessions.
              </p>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          {!hydrated || activity.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No activity yet — try a quick action above to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {a.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activityLabels[a.kind] ?? a.kind}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Productivity Score</h3>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-foreground">
              {hydrated ? score : 20}
              <span className="ml-1 text-base font-medium text-muted-foreground">/100</span>
            </div>
          </div>
          <Progress value={hydrated ? score : 20} className="mt-3" />
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {suggestions.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {s}
              </li>
            ))}
          </ul>
          <Link
            to="/workspace"
            className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <FolderKanban className="h-3.5 w-3.5" /> Open your AI Workspace →
          </Link>
        </Card>
      </section>
    </div>
  );
}
