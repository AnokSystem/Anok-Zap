
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
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
