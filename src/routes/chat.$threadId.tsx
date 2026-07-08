import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Copy, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NovaAvatar } from "@/components/nova-avatar";
import { useHydrated } from "@/hooks/use-storage";
import {
  bumpStat,
  getThread,
  pushActivity,
  upsertThread,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadRoute,
});

function ChatThreadRoute() {
  const { threadId } = Route.useParams();
  const hydrated = useHydrated();
  if (!hydrated) {
    return <div className="grid h-full place-items-center text-muted-foreground">Loading…</div>;
  }
  return <ChatThread key={threadId} threadId={threadId} />;
}

function extractText(m: UIMessage): string {
  return (m.parts ?? [])
    .map((p) => ((p as { type: string; text?: string }).type === "text" ? (p as { text?: string }).text ?? "" : ""))
    .join("");
}

function ChatThread({ threadId }: { threadId: string }) {
  const initialMessages = useMemo<UIMessage[]>(() => {
    return getThread(threadId)?.messages ?? [];
  }, [threadId]);

  const [input, setInput] = useState("");
  const bumpedRef = useRef(false);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message ?? "Something went wrong"),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Persist thread + activity when messages settle.
  useEffect(() => {
    if (messages.length === 0) return;
    const first = messages.find((m) => m.role === "user");
    const title = first ? extractText(first).slice(0, 60) || "New chat" : "New chat";
    upsertThread({ id: threadId, title, updatedAt: Date.now(), messages });
    if (status === "ready" && !bumpedRef.current && messages.some((m) => m.role === "assistant")) {
      bumpedRef.current = true;
      bumpStat("chat");
      pushActivity({ kind: "chat", title });
    }
  }, [messages, status, threadId]);

  // Auto-scroll to bottom on new content
  const scrollRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  // Focus textarea on mount + after send + when thread changes
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    bumpedRef.current = false;
    sendMessage({ text });
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    upsertThread({ id: threadId, title: "New chat", updatedAt: Date.now(), messages: [] });
    bumpedRef.current = false;
    inputRef.current?.focus();
  };

  const regenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    // remove trailing assistant reply(s)
    let cut = messages.length;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") cut = i;
      else break;
    }
    const truncated = messages.slice(0, cut);
    setMessages(truncated.slice(0, -1)); // drop last user; sendMessage re-adds
    bumpedRef.current = false;
    sendMessage({ text: extractText(lastUser) });
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <NovaAvatar size={36} />
          <div>
            <div className="text-sm font-semibold text-foreground">Nova</div>
            <div className="text-xs text-muted-foreground">
              {isLoading ? "Typing…" : "Your AI workplace assistant"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.some((m) => m.role === "assistant") && (
            <Button variant="ghost" size="sm" onClick={regenerate} disabled={isLoading} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearChat} disabled={isLoading} className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear chat</span>
          </Button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-md text-center">
            <NovaAvatar size={56} className="mx-auto" />
            <h2 className="mt-4 text-xl font-bold text-foreground">
              Hi, I'm Nova 👋
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask me about workplace questions, productivity, brainstorming, writing, coding, business ideas — anything you need.
            </p>
            <div className="mt-4 grid gap-2 text-left">
              {[
                "Help me plan my week around three big priorities.",
                "Draft a short standup update for my team.",
                "Explain OKRs to a new manager.",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {status === "submitted" && <TypingIndicator />}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error.message}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-background p-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask Nova anything..."
            rows={1}
            className="max-h-40 min-h-[40px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Nova can make mistakes. Verify important information.
        </p>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = extractText(message);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <NovaAvatar size={32} className="mt-0.5 shrink-0" />
      <div className="group max-w-full flex-1">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
          {text || <span className="text-muted-foreground">…</span>}
        </div>
        {text && (
          <button
            onClick={copy}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition hover:text-foreground group-hover:opacity-100"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <NovaAvatar size={32} className="shrink-0" />
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-3 py-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}