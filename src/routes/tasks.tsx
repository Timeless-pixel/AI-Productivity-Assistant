import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ListChecks, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { planTasks } from "@/lib/ai.functions";
import { bumpStat, pushActivity } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkWise AI" },
      { name: "description", content: "Turn a workplace goal into an actionable prioritised plan." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    prompt: typeof s.prompt === "string" ? s.prompt : undefined,
  }),
  component: TasksPage,
});

type Task = { text: string; meta?: string };

function extractTasks(md: string): Task[] {
  return md
    .split("\n")
    .map((l) => l.match(/^\s*-\s*\[.\]\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => {
      const parts = m[1].split(/\s+—\s+\*(.+)\*$/);
      return { text: parts[0].trim(), meta: parts[1]?.trim() };
    });
}

function TasksPage() {
  const search = Route.useSearch();
  const run = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [output, setOutput] = useState("");
  const [ts, setTs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (search.prompt && !goal) {
      try {
        setGoal(decodeURIComponent(search.prompt));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.prompt]);

  const tasks = useMemo(() => extractTasks(output), [output]);

  const submit = async () => {
    if (!goal.trim()) {
      toast.error("Enter a workplace goal.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { goal } });
      setOutput(res.text);
      setTs(Date.now());
      setChecks({});
      bumpStat("tasks");
      pushActivity({ kind: "tasks", title: goal.slice(0, 60) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Planning failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="AI Feature"
        title="AI Task Planner"
        description="Describe a goal — Nova breaks it into prioritised, time-estimated tasks with risks and recommendations."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <ListChecks className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-foreground">Your goal</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal">Workplace goal *</Label>
              <Textarea
                id="goal"
                rows={5}
                placeholder="e.g. Prepare a client presentation for Friday's 3pm review."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full gap-2">
              <Wand2 className="h-4 w-4" />
              {loading ? "Planning…" : "Generate plan"}
            </Button>
          </div>
          {tasks.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Task checklist ({Object.values(checks).filter(Boolean).length}/{tasks.length})
              </h3>
              <ul className="space-y-2">
                {tasks.map((t, i) => (
                  <li key={i}>
                    <Card className="p-3">
                      <label className="flex items-start gap-3">
                        <Checkbox
                          checked={!!checks[i]}
                          onCheckedChange={(v) =>
                            setChecks((prev) => ({ ...prev, [i]: !!v }))
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-sm ${
                              checks[i]
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {t.text}
                          </div>
                          {t.meta && (
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {t.meta}
                            </div>
                          )}
                        </div>
                      </label>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <div className="lg:col-span-3">
          <AiOutputCard
            content={output}
            loading={loading}
            timestamp={ts}
            onRegenerate={output ? submit : undefined}
            saveKind="tasks"
            saveTitle={goal}
            emptyMessage="Enter a goal to generate a full task plan."
          />
        </div>
      </div>
    </div>
  );
}