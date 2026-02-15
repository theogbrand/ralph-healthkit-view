'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-180 dark:scale-0" />
      <Moon className="absolute size-4 rotate-180 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
