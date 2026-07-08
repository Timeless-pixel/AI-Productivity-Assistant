import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { summariseMeeting } from "@/lib/ai.functions";
import { bumpStat, pushActivity } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summariser — WorkWise AI" },
      { name: "description", content: "Turn raw meeting notes into clear summaries with action items." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summariseMeeting);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [ts, setTs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (notes.trim().length < 20) {
      toast.error("Paste some meeting notes or a transcript first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { notes } });
      setOutput(res.text);
      setTs(Date.now());
      bumpStat("meeting");
      pushActivity({ kind: "meeting", title: notes.slice(0, 60) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Summary failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportMd = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="AI Feature"
        title="Meeting Notes Summariser"
        description="Paste raw notes or a transcript — get a summary, decisions, action items, deadlines and next steps."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-foreground">Meeting notes</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Paste transcript or notes</Label>
              <Textarea
                id="notes"
                rows={16}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your meeting transcript or bullet notes here…"
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full gap-2">
              <Wand2 className="h-4 w-4" />
              {loading ? "Summarising…" : "Summarise meeting"}
            </Button>
          </div>
        </Card>
        <AiOutputCard
          content={output}
          loading={loading}
          timestamp={ts}
          onRegenerate={output ? submit : undefined}
          emptyMessage="Your meeting summary will appear here."
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
  );
}