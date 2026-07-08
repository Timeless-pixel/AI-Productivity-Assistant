import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  Search,
  MessageSquare,
  FileText,
  ListChecks,
  LibraryBig,
  FolderKanban,
  ShieldCheck,
  User,
  Settings as SettingsIcon,
  BarChart3,
  History,
  FileSearch,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useCommandHistory, useWorkspace } from "@/hooks/use-storage";
import { pushCommandHistory } from "@/lib/storage";

type Cmd = { id: string; label: string; icon: React.ElementType; to: string; keywords?: string };

const commands: Cmd[] = [
  { id: "/", label: "Dashboard", icon: LayoutDashboard, to: "/", keywords: "home overview" },
  { id: "/email", label: "Smart Email Generator", icon: Mail, to: "/email" },
  { id: "/research", label: "AI Research Assistant", icon: Search, to: "/research" },
  { id: "/chat", label: "AI Chatbot", icon: MessageSquare, to: "/chat" },
  { id: "/meetings", label: "Meeting Notes Summariser", icon: FileText, to: "/meetings" },
  { id: "/tasks", label: "AI Task Planner", icon: ListChecks, to: "/tasks" },
  { id: "/templates", label: "Prompt Templates", icon: LibraryBig, to: "/templates" },
  { id: "/workspace", label: "AI Workspace", icon: FolderKanban, to: "/workspace" },
  { id: "/analytics", label: "Analytics", icon: BarChart3, to: "/analytics" },
  { id: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck, to: "/responsible-ai" },
  { id: "/profile", label: "User Profile", icon: User, to: "/profile" },
  { id: "/settings", label: "Settings", icon: SettingsIcon, to: "/settings" },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const history = useCommandHistory();
  const docs = useWorkspace();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const go = (to: string) => {
    pushCommandHistory(to);
    onOpenChange(false);
    navigate({ to });
  };

  const recentCommands = history
    .map((u) => commands.find((c) => c.to === u))
    .filter((c): c is Cmd => !!c);

  const matchedDocs = q.trim()
    ? docs
        .filter(
          (d) =>
            d.title.toLowerCase().includes(q.toLowerCase()) ||
            d.content.toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={q}
        onValueChange={setQ}
        placeholder="What would you like to do today?"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {!q && recentCommands.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentCommands.map((c) => (
                <CommandItem key={"recent-" + c.id} value={"recent " + c.label} onSelect={() => go(c.to)}>
                  <History className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{c.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        <CommandGroup heading="Navigate">
          {commands.map((c) => (
            <CommandItem
              key={c.id}
              value={`${c.label} ${c.keywords ?? ""}`}
              onSelect={() => go(c.to)}
            >
              <c.icon className="mr-2 h-4 w-4 text-primary" />
              <span>{c.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {matchedDocs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Workspace documents">
              {matchedDocs.map((d) => (
                <CommandItem
                  key={d.id}
                  value={"doc " + d.title}
                  onSelect={() => go("/workspace")}
                >
                  <FileSearch className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{d.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden gap-2 text-muted-foreground sm:inline-flex"
      >
        <Search className="h-4 w-4" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
      >
        <Search className="h-5 w-5" />
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}