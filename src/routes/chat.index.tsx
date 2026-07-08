import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated, useThreads } from "@/hooks/use-storage";
import { upsertThread } from "@/lib/storage";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const threads = useThreads();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const decided = useRef(false);

  useEffect(() => {
    if (!hydrated || decided.current) return;
    if (threads.length > 0) {
      decided.current = true;
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id } });
    }
  }, [hydrated, threads, navigate]);

  const createThread = () => {
    const id = crypto.randomUUID();
    upsertThread({ id, title: "New chat", updatedAt: Date.now(), messages: [] });
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <div className="max-w-md">
        <MessageSquare className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-xl font-bold text-foreground">Start chatting with Nova</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask about workplace questions, productivity, brainstorming, writing, coding, business ideas — anything you need.
        </p>
        <Button onClick={createThread} className="mt-4 gap-2">
          <Plus className="h-4 w-4" /> New chat
        </Button>
      </div>
    </div>
  );
}