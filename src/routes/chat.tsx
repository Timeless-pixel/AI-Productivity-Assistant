import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useThreads } from "@/hooks/use-storage";
import {
  deleteThread as deleteThreadStorage,
  upsertThread,
} from "@/lib/storage";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — WorkWise AI" },
      { name: "description", content: "Chat with Nova, your AI workplace assistant." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const threads = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const createThread = () => {
    const id = crypto.randomUUID();
    upsertThread({ id, title: "New chat", updatedAt: Date.now(), messages: [] });
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const deleteThread = (id: string) => {
    deleteThreadStorage(id);
    if (id === activeId) {
      navigate({ to: "/chat" });
    }
  };

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => b.updatedAt - a.updatedAt),
    [threads],
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-7xl gap-4">
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] md:flex">
        <Button onClick={createThread} className="w-full gap-2">
          <Plus className="h-4 w-4" /> New chat
        </Button>
        <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversations
        </div>
        <ScrollArea className="mt-1 flex-1">
          {sortedThreads.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-1 p-1">
              {sortedThreads.map((t) => {
                const isActive = t.id === activeId;
                return (
                  <li key={t.id}>
                    <div
                      className={`group flex items-center gap-1 rounded-lg ${
                        isActive ? "bg-accent" : "hover:bg-accent/60"
                      }`}
                    >
                      <Link
                        to="/chat/$threadId"
                        params={{ threadId: t.id }}
                        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-sm"
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{t.title || "New chat"}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteThread(t.id)}
                        className="mr-1 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
