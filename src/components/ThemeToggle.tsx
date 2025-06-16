
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="theme-toggle-btn flex items-center space-x-2"
      title={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">
        {isDark ? 'Claro' : 'Escuro'}
      </span>
    </Button>
  );
};

export default ThemeToggle;
