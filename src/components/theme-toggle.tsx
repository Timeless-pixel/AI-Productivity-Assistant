import { Sun, Moon, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings, useHydrated } from "@/hooks/use-storage";

export function ThemeToggle() {
  const [settings, save] = useSettings();
  const hydrated = useHydrated();
  const set = (theme: "light" | "dark" | "dynamic") => save({ ...settings, theme });
  const current = hydrated ? settings.theme : "light";
  const Icon = current === "dark" ? Moon : current === "dynamic" ? Sunrise : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => set("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => set("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => set("dynamic")}>
          <Sunrise className="mr-2 h-4 w-4" /> Dynamic (time-based)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}