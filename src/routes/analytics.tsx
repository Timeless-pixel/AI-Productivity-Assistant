import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Mail,
  Search,
  FileText,
  ListChecks,
  MessageSquare,
  FolderKanban,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  useActivity,
  useHydrated,
  useStats,
  useStreak,
  useWorkspace,
} from "@/hooks/use-storage";
import {
  activityByDay,
  estimatedHoursSaved,
  novaInsights,
  productivityScore,
} from "@/lib/storage";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "AI Usage Analytics — WorkWise AI" },
      {
        name: "description",
        content: "Track your WorkWise AI usage, productivity streak and estimated time saved.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const stats = useStats();
  const activity = useActivity();
  const streak = useStreak();
  const workspace = useWorkspace();
  const hydrated = useHydrated();

  const data = hydrated ? activityByDay(activity) : [];
  const weekTotal = data.reduce((a, b) => a + b.count, 0);
  const hours = hydrated ? estimatedHoursSaved(stats) : 0;
  const score = hydrated ? productivityScore(stats) : 20;
  const insights = hydrated ? novaInsights(stats, streak.current) : [];

  const cards = [
    { label: "Emails generated", value: stats.email, icon: Mail },
    { label: "Research reports", value: stats.research, icon: Search },
    { label: "Meetings summarised", value: stats.meeting, icon: FileText },
    { label: "Task plans", value: stats.tasks, icon: ListChecks },
    { label: "AI conversations", value: stats.chat, icon: MessageSquare },
    { label: "Workspace saves", value: workspace.length, icon: FolderKanban },
    { label: "Productivity streak", value: `${streak.current}d`, icon: Flame },
    { label: "Estimated time saved", value: `${hours}h`, icon: Clock },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="AI Usage Analytics"
        description="Understand how you use WorkWise AI and see the productivity gains you've unlocked."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <c.icon className="h-4 w-4 text-primary" />
              {c.label}
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {hydrated ? c.value : 0}
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Last 7 days</h3>
              <p className="text-sm text-muted-foreground">
                {hydrated
                  ? `This week you completed ${weekTotal} AI-assisted task${weekTotal === 1 ? "" : "s"} and saved approximately ${hours} hours.`
                  : "Loading your activity…"}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Nova insights</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalised suggestions based on how you work.
          </p>
          <ul className="mt-4 space-y-3">
            {insights.length === 0 ? (
              <li className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                Run a few AI actions and Nova will craft suggestions here.
              </li>
            ) : (
              insights.map((t) => (
                <li
                  key={t}
                  className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-foreground animate-fade-in"
                >
                  💡 {t}
                </li>
              ))
            )}
          </ul>
          <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Weekly productivity score
            </div>
            <div className="mt-1 text-3xl font-bold text-foreground">
              {score}
              <span className="ml-1 text-sm font-medium text-muted-foreground">/100</span>
            </div>
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Usage trend</h3>
          <span className="text-xs text-muted-foreground">Activity per day</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}