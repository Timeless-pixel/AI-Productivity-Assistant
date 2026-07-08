import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RefreshCw, Check, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NovaAvatar } from "./nova-avatar";
import { toast } from "sonner";
import { addWorkspaceDoc, type ActivityKind } from "@/lib/storage";

function renderMarkdown(md: string): string {
  // Minimal, safe-ish markdown -> HTML for our controlled AI output.
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const lines = md.split("\n");
  let html = "";
  let inList: false | "ul" | "ol" = false;
  const flushList = () => {
    if (inList) {
      html += `</${inList}>`;
      inList = false;
    }
  };
  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length;
      const cls =
        level === 1
          ? "mt-4 mb-2 text-xl font-bold text-foreground"
          : level === 2
            ? "mt-4 mb-2 text-lg font-bold text-foreground"
            : "mt-3 mb-1 text-base font-semibold text-foreground";
      html += `<h${level} class="${cls}">${inline(h[2])}</h${level}>`;
      continue;
    }
    const li = /^[-*]\s+(.*)$/.exec(line);
    if (li) {
      if (inList !== "ul") {
        flushList();
        html += '<ul class="my-2 ml-5 list-disc space-y-1">';
        inList = "ul";
      }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }
    const oli = /^\d+\.\s+(.*)$/.exec(line);
    if (oli) {
      if (inList !== "ol") {
        flushList();
        html += '<ol class="my-2 ml-5 list-decimal space-y-1">';
        inList = "ol";
      }
      html += `<li>${inline(oli[1])}</li>`;
      continue;
    }
    flushList();
    html += `<p class="my-2 leading-relaxed">${inline(line)}</p>`;
  }
  flushList();
  return html;
}

export function AiOutputCard({
  content,
  loading,
  onRegenerate,
  timestamp,
  emptyMessage = "Your AI-generated response will appear here.",
  extraActions,
  saveKind,
  saveTitle,
}: {
  content: string;
  loading?: boolean;
  onRegenerate?: () => void;
  timestamp?: number | null;
  emptyMessage?: string;
  extraActions?: React.ReactNode;
  saveKind?: ActivityKind;
  saveTitle?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const html = useMemo(() => (content ? renderMarkdown(content) : ""), [content]);
  const lastNotified = useRef<string>("");

  // Rotating thinking messages
  const thinkingSteps = useMemo(
    () => [
      "🤖 Nova is thinking…",
      saveKind === "email"
        ? "✍️ Writing your professional email…"
        : saveKind === "research"
          ? "📚 Researching your topic…"
          : saveKind === "meeting"
            ? "📝 Organising your meeting notes…"
            : saveKind === "tasks"
              ? "📅 Planning your schedule…"
              : "🧠 Analysing your request…",
      "💡 Generating the best response…",
    ],
    [saveKind],
  );
  const [stepIx, setStepIx] = useState(0);
  useEffect(() => {
    if (!loading) {
      setStepIx(0);
      return;
    }
    const id = window.setInterval(() => setStepIx((i) => (i + 1) % thinkingSteps.length), 1800);
    return () => window.clearInterval(id);
  }, [loading, thinkingSteps.length]);

  // Success notification on completion (once per new content)
  useEffect(() => {
    if (!loading && content && lastNotified.current !== content) {
      lastNotified.current = content;
      toast.success("✅ Response generated successfully");
      setSaved(false);
    }
  }, [loading, content]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const save = () => {
    if (!content || !saveKind) return;
    addWorkspaceDoc({
      title: saveTitle?.trim() || `${saveKind} — ${new Date().toLocaleString()}`,
      content,
      source: saveKind,
    });
    setSaved(true);
    toast.success("Saved to workspace");
    setTimeout(() => setSaved(false), 1500);
  };

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <Card className="overflow-hidden border-border/60 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-[var(--gradient-soft)] px-5 py-3">
        <div className="flex items-center gap-3">
          <NovaAvatar size={32} />
          <div>
            <div className="text-sm font-semibold text-foreground">Nova</div>
            <div className="text-xs text-muted-foreground">
              {loading ? "Thinking…" : time ? `Generated at ${time}` : "AI response"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {extraActions}
          {saveKind && (
            <Button
              size="sm"
              variant="ghost"
              onClick={save}
              disabled={!content || loading}
              className="gap-1.5"
            >
              {saved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
              <span className="hidden sm:inline">Save</span>
            </Button>
          )}
          {onRegenerate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRegenerate}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={copy}
            disabled={!content}
            className="gap-1.5"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">Copy</span>
          </Button>
        </div>
      </div>
      <div className="min-h-[180px] px-5 py-4">
        {loading && !content ? (
          <div className="flex items-center gap-3">
            <NovaAvatar size={36} className="animate-pulse" />
            <div>
              <div key={stepIx} className="animate-fade-in text-sm font-medium text-foreground">
                {thinkingSteps[stepIx]}
              </div>
              <div className="mt-1.5 flex gap-1">
                <span className="nova-dot h-1.5 w-1.5 rounded-full bg-primary" />
                <span
                  className="nova-dot h-1.5 w-1.5 rounded-full bg-primary"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="nova-dot h-1.5 w-1.5 rounded-full bg-primary"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        ) : content ? (
          <div
            className="prose prose-sm max-w-none animate-fade-in text-foreground"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </Card>
  );
}