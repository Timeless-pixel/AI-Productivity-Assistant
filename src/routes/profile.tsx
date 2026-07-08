import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { useHydrated, useProfile, useStats } from "@/hooks/use-storage";
import { productivityScore } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — WorkWise AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useProfile();
  const stats = useStats();
  const hydrated = useHydrated();
  const [name, setName] = useState(profile.name);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [avatar, setAvatar] = useState(profile.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hydrated) {
      setName(profile.name);
      setJobTitle(profile.jobTitle);
      setAvatar(profile.avatar);
    }
  }, [hydrated, profile.name, profile.jobTitle, profile.avatar]);

  const onUpload = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(f);
  };

  const save = () => {
    setProfile({ name: name.trim() || "You", jobTitle, avatar });
    toast.success("Profile saved");
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow="Account" title="Profile" description="Personalise your workspace." />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="relative">
              <div
                className="grid h-24 w-24 place-items-center overflow-hidden rounded-full text-2xl font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{(name || "Y").slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow"
                aria-label="Upload picture"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job">Job title</Label>
                <Input id="job" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <Button onClick={save} className="gap-2">
                <Save className="h-4 w-4" /> Save profile
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-base font-semibold text-foreground">AI usage</h3>
          <div className="mt-4 space-y-3 text-sm">
            {(
              [
                ["Emails generated", stats.email],
                ["Research sessions", stats.research],
                ["Meetings summarised", stats.meeting],
                ["Task plans created", stats.tasks],
                ["Chats with Nova", stats.chat],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground">{val}</span>
              </div>
            ))}
            <div className="mt-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total activities</span>
                <span className="font-semibold text-foreground">{total}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Productivity score</span>
                <span className="font-semibold text-primary">
                  {productivityScore(stats)}/100
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}