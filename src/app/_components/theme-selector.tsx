"use client";

import * as React from "react";
import { Leaf, Palette, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type ThemeSelectorProps = {
  showLabels?: boolean;
};

export default function ThemeSelector({
  showLabels = true,
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid mismatch on SSR

  const options: { id: string; label: string; icon: React.ReactNode }[] = [
    {
      id: "light",
      label: "Hijau",
      icon: <Leaf className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: "theme-rose",
      label: "Rose",
      icon: <Palette className="h-4 w-4 text-pink-500" />,
    },
    {
      id: "theme-ocean",
      label: "Ocean",
      icon: <Moon className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <div className="flex items-center gap-2 px-1">
      {options.map((opt) => (
        <Button
          key={opt.id}
          variant={theme === opt.id ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme(opt.id)}
          className="flex items-center gap-2"
          aria-pressed={theme === opt.id}
          title={`${opt.label} theme`}
        >
          {opt.icon}
          {showLabels ? (
            <span className="hidden sm:inline text-sm">{opt.label}</span>
          ) : null}
        </Button>
      ))}
    </div>
  );
}
