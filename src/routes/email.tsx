import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { PageHeader } from "@/components/page-header";
import { AiOutputCard } from "@/components/ai-output-card";
import { generateEmail } from "@/lib/ai.functions";
import { bumpStat, pushActivity } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkWise AI" },
      {
        name: "description",
        content: "Generate polished professional emails with tone, length and detail controls.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [details, setDetails] = useState("");
  const [output, setOutput] = useState("");
  const [ts, setTs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!purpose.trim()) {
      toast.error("Add an email purpose first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { purpose, recipient, tone, length, details } });
      setOutput(res.text);
      setTs(Date.now());
      bumpStat("email");
      pushActivity({ kind: "email", title: purpose.slice(0, 60) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPurpose("");
    setRecipient("");
    setDetails("");
    setOutput("");
    setTs(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="AI Feature"
        title="Smart Email Generator"
        description="Describe what you need, choose a tone and length — Nova drafts a polished email complete with subject, greeting, body and closing."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Mail className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-foreground">Email details</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Email purpose *</Label>
              <Input
                id="purpose"
                placeholder="e.g. Follow up after Monday's product demo"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g. Sarah, Marketing Director at Acme"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Professional", "Friendly", "Formal", "Persuasive", "Apologetic"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Short", "Medium", "Long"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="details">Additional details</Label>
              <Textarea
                id="details"
                rows={4}
                placeholder="Any context, key points to include, deadlines, etc."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={loading} className="flex-1 gap-2">
                <Wand2 className="h-4 w-4" />
                {loading ? "Generating…" : "Generate email"}
              </Button>
              <Button variant="outline" onClick={clear} disabled={loading} className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <AiOutputCard
            content={output}
            loading={loading}
            timestamp={ts}
            onRegenerate={output ? submit : undefined}
            emptyMessage="Fill in the details on the left, then Nova will draft your email here."
          />
        </div>
      </div>
    </div>
  );
}