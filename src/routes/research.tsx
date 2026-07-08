import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { runResearch } from "@/lib/ai.functions";
import { bumpStat, pushActivity } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — WorkWise AI" },
      { name: "description", content: "Structured AI-powered workplace research reports." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(runResearch);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Standard");
  const [output, setOutput] = useState("");
  const [ts, setTs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!topic.trim()) {
      toast.error("Enter a research topic first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { topic, depth } });
      setOutput(res.text);
      setTs(Date.now());
      bumpStat("research");
      pushActivity({ kind: "research", title: topic.slice(0, 60) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Research failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportMd = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-${topic.slice(0, 30).replace(/\s+/g, "-") || "report"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="AI Feature"
        title="AI Research Assistant"
        description="Get a clear, structured report with summary, advantages, challenges, recommendations and follow-up questions."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Search className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-foreground">Research request</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Research topic *</Label>
              <Input
                id="topic"
                placeholder="e.g. Best practices for remote onboarding"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Research depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Quick overview", "Standard", "In-depth"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={submit} disabled={loading} className="w-full gap-2">
              <Wand2 className="h-4 w-4" />
              {loading ? "Researching…" : "Run research"}
            </Button>
          </div>
        </Card>
        <div className="lg:col-span-3">
          <AiOutputCard
            content={output}
            loading={loading}
            timestamp={ts}
            onRegenerate={output ? submit : undefined}
            emptyMessage="Enter a topic to receive a structured research report."
            extraActions={
              output ? (
                <Button size="sm" variant="ghost" onClick={exportMd} className="gap-1.5">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  );
}