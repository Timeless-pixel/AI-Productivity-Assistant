import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, Bell, Languages, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useSettings } from "@/hooks/use-storage";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — WorkWise AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, save] = useSettings();
  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) =>
    save({ ...settings, [key]: value });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Customise your WorkWise AI experience." />

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={settings.theme === "light" ? "default" : "outline"}
            onClick={() => update("theme", "light")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" /> Light mode
          </Button>
          <Button
            variant={settings.theme === "dark" ? "default" : "outline"}
            onClick={() => update("theme", "dark")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" /> Dark mode
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notif" className="text-sm font-medium">
              Product updates & tips
            </Label>
            <p className="text-xs text-muted-foreground">Occasional in-app tips from Nova.</p>
          </div>
          <Switch
            id="notif"
            checked={settings.notifications}
            onCheckedChange={(v) => update("notifications", v)}
          />
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">AI response style</h2>
        </div>
        <Select value={settings.aiStyle} onValueChange={(v) => update("aiStyle", v as never)}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concise">Concise</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Language</h2>
        </div>
        <Select value={settings.language} onValueChange={(v) => update("language", v)}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["English", "Español", "Français", "Deutsch", "Português", "日本語"].map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
    </div>
  );
}