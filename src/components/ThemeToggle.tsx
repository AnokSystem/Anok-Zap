
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Sun className={`w-4 h-4 transition-colors duration-300 ${!isDark ? 'text-orange-400' : 'text-gray-500'}`} />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-orange-500"
      />
      <Moon className={`w-4 h-4 transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-gray-500'}`} />
    </div>
  );
};

export default ThemeToggle;
