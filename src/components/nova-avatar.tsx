import { cn } from "@/lib/utils";
import { Sparkle } from "lucide-react";

export function NovaAvatar({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: "var(--gradient-primary)",
      }}
      aria-hidden
    >
      <Sparkle className="h-1/2 w-1/2" strokeWidth={2.5} />
      <span
        className="absolute inset-0 rounded-full ring-2 ring-background/30"
        aria-hidden
      />
    </div>
  );
}