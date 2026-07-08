import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Star, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { toggleFavoriteTemplate } from "@/lib/storage";
import { useFavoriteTemplates, useHydrated } from "@/hooks/use-storage";
import { toast } from "sonner";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Prompt Templates — WorkWise AI" },
      { name: "description", content: "Pre-built professional prompt templates for common workplace tasks." },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const favs = useFavoriteTemplates();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof TEMPLATE_CATEGORIES)[number]>("All");
  const [onlyFav, setOnlyFav] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (onlyFav && !favs.includes(t.id)) return false;
      if (!needle) return true;
      return (
        t.title.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle) ||
        t.prompt.toLowerCase().includes(needle)
      );
    });
  }, [q, cat, onlyFav, favs]);

  const use = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    const prompt = encodeURIComponent(t.prompt);
    if (t.target === "email") navigate({ to: "/email", search: { prompt } as never });
    else if (t.target === "research") navigate({ to: "/research", search: { prompt } as never });
    else if (t.target === "meetings") navigate({ to: "/meetings", search: { prompt } as never });
    else if (t.target === "tasks") navigate({ to: "/tasks", search: { prompt } as never });
    else navigate({ to: "/chat", search: { prompt } as never });
    toast.success(`Loaded "${t.title}" template`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Prompt Library"
        title="Prompt Templates"
        description="Kick-start any AI task with a professionally written prompt. Edit before sending."
      />

      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates…"
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {TEMPLATE_CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={cat === c ? "default" : "outline"}
                onClick={() => setCat(c)}
              >
                {c}
              </Button>
            ))}
            <Button
              size="sm"
              variant={onlyFav ? "default" : "outline"}
              onClick={() => setOnlyFav((v) => !v)}
              className="gap-1"
            >
              <Star className="h-3.5 w-3.5" /> Favorites
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const isFav = hydrated && favs.includes(t.id);
          return (
            <Card
              key={t.id}
              className="flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-xl">
                    {t.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.title}</div>
                    <Badge variant="secondary" className="mt-1">
                      {t.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleFavoriteTemplate(t.id)}
                  aria-label="Favorite"
                >
                  <Star
                    className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </Button>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-3 rounded-md border border-dashed border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground line-clamp-3">
                {t.prompt}
              </div>
              <Button className="mt-4 gap-2" onClick={() => use(t.id)}>
                Use template <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No templates match your filters.
        </div>
      )}
    </div>
  );
}