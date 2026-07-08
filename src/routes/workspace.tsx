import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Star,
  Pin,
  Trash2,
  Folder,
  Tag as TagIcon,
  Mail,
  FileText,
  ListChecks,
  MessageSquare,
  FolderPlus,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { useWorkspace, useHydrated } from "@/hooks/use-storage";
import {
  deleteWorkspaceDoc,
  updateWorkspaceDoc,
  type ActivityKind,
  type WorkspaceDoc,
} from "@/lib/storage";
import { toast } from "sonner";

const sourceIcon: Record<ActivityKind, typeof Mail> = {
  email: Mail,
  research: Search,
  meeting: FileText,
  tasks: ListChecks,
  chat: MessageSquare,
};

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "AI Workspace — WorkWise AI" },
      { name: "description", content: "Save, organise and revisit everything Nova generates." },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const docs = useWorkspace();
  const hydrated = useHydrated();
  const [q, setQ] = useState("");
  const [source, setSource] = useState<string>("all");
  const [folder, setFolder] = useState<string>("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [open, setOpen] = useState<WorkspaceDoc | null>(null);

  const folders = useMemo(() => {
    const set = new Set<string>(["Inbox"]);
    docs.forEach((d) => set.add(d.folder));
    return [...set];
  }, [docs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return docs
      .filter((d) => (source === "all" ? true : d.source === source))
      .filter((d) => (folder === "all" ? true : d.folder === folder))
      .filter((d) => (onlyFav ? d.favorite : true))
      .filter((d) =>
        needle
          ? d.title.toLowerCase().includes(needle) ||
            d.content.toLowerCase().includes(needle) ||
            d.tags.some((t) => t.toLowerCase().includes(needle))
          : true,
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [docs, q, source, folder, onlyFav]);

  const pinned = filtered.filter((d) => d.pinned);
  const rest = filtered.filter((d) => !d.pinned);

  const newFolder = () => {
    const name = window.prompt("New folder name")?.trim();
    if (!name) return;
    setFolder(name);
    toast.success(`Switched to folder "${name}" — move a document into it from its card.`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Your hub"
        title="AI Workspace"
        description="Your AI Workspace keeps everything you've created in one organised place."
      />

      <div className="rounded-[var(--radius-lg)] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        ✨ Everything you create with AI is securely organized in your Workspace.
      </div>

      <Card className="p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search saved documents, tags, content…"
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={newFolder} className="gap-1">
              <FolderPlus className="h-4 w-4" /> New folder
            </Button>
            <Button
              size="sm"
              variant={onlyFav ? "default" : "outline"}
              onClick={() => setOnlyFav((v) => !v)}
              className="gap-1"
            >
              <Star className="h-4 w-4" /> Favorites
            </Button>
          </div>
        </div>
      </Card>

      {hydrated && docs.length === 0 ? (
        <Card className="p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 text-lg font-semibold text-foreground">Nothing saved yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Run any AI action, then click "Save to workspace" on Nova's response.
          </p>
        </Card>
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                📌 Pinned
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pinned.map((d) => (
                  <DocCard key={d.id} doc={d} folders={folders} onOpen={() => setOpen(d)} />
                ))}
              </div>
            </section>
          )}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              🕒 Recent
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((d) => (
                <DocCard key={d.id} doc={d} folders={folders} onOpen={() => setOpen(d)} />
              ))}
              {rest.length === 0 && (
                <div className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No documents match your filters.
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {open.content}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocCard({
  doc,
  folders,
  onOpen,
}: {
  doc: WorkspaceDoc;
  folders: string[];
  onOpen: () => void;
}) {
  const Icon = sourceIcon[doc.source] ?? FileText;
  const rename = () => {
    const name = window.prompt("Rename document", doc.title)?.trim();
    if (name) updateWorkspaceDoc(doc.id, { title: name });
  };
  const moveTo = (f: string) => updateWorkspaceDoc(doc.id, { folder: f });
  const addTag = () => {
    const t = window.prompt("Add tag")?.trim();
    if (t) updateWorkspaceDoc(doc.id, { tags: Array.from(new Set([...doc.tags, t])) });
  };

  return (
    <Card className="group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <button
            onClick={rename}
            className="truncate text-left text-sm font-semibold text-foreground hover:underline"
            title="Click to rename"
          >
            {doc.title}
          </button>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => updateWorkspaceDoc(doc.id, { pinned: !doc.pinned })}
            aria-label="Pin"
          >
            <Pin className={`h-4 w-4 ${doc.pinned ? "fill-primary text-primary" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => updateWorkspaceDoc(doc.id, { favorite: !doc.favorite })}
            aria-label="Favorite"
          >
            <Star className={`h-4 w-4 ${doc.favorite ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
      </div>
      <button
        onClick={onOpen}
        className="mt-3 line-clamp-4 text-left text-xs text-muted-foreground hover:text-foreground"
      >
        {doc.content}
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <Badge variant="secondary" className="gap-1">
          <Folder className="h-3 w-3" /> {doc.folder}
        </Badge>
        {doc.tags.map((t) => (
          <Badge key={t} variant="outline" className="gap-1">
            <TagIcon className="h-3 w-3" /> {t}
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <div className="text-xs text-muted-foreground">
          {new Date(doc.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <Select value={doc.folder} onValueChange={moveTo}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {folders.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={addTag} aria-label="Add tag">
            <TagIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              deleteWorkspaceDoc(doc.id);
              toast.success("Deleted");
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}